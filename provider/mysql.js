'use strict';

const assert = require('assert');
const DbCommand = require('../command');
const Execution = require('./execution');
const Configuration = require('../configuration');

class MysqlProvider {
  constructor(options) {
    this.config = new Configuration(options);
    this.command = new DbCommand(options, this.config);
  }

  parseSelect(data) {
    let sql = '';
    const arg = [];
    sql = 'select ' + data.select;
    sql += ' from ' + data.from;
    arg.push.apply(arg, data.fromArg);

    if (data.where.length) {
      const where = this.parseWhere(data.where);
      sql += where.sql;
      arg.push.apply(arg, where.arg);
    }

    if (data.groupby) {
      sql += ' group by ' + data.groupby;
    }

    if (data.having) {
      sql += ' having ' + data.having;
    }

    if (data.orderby) {
      sql += ' order by ' + data.orderby;
    }

    // 分页处理
    if (data.rows > 0 && data.page > 0) {
      const offset = data.rows * data.page - data.rows;
      sql += ' limit ';
      if (offset > 0) {
        sql += offset + ', ';
      }
      sql += data.rows;
    }

    return new Execution(this.command, sql, arg);
  }

  parseInsert(data) {
    // 把单行数据转成数组
    let rows = data.data;
    if (!Array.isArray(rows)) {
      rows = [ rows ];
    }

    // 取得要插入的数据列
    const columns = [];
    const firstRow = rows[0];
    Object.keys(firstRow).forEach(key => {
      columns.push(key);
    });

    // 处理每一行需要插入的数据
    const arg = [ data.table, columns ];
    const valueArr = [];
    rows.forEach(row => {
      const values = [];
      columns.forEach(key => values.push(row[key]));
      valueArr.push('(?)');
      arg.push(values);
    });
    const sql = 'insert into ??(??) values ' + valueArr.join(', ');

    return new Execution(this.command, sql, arg);
  }

  parseUpdate(data) {
    let sql = 'update ?? set ';
    const arg = [ data.table ];

    const set = [];
    Object.keys(data.data).forEach(key => {
      set.push('?? = ?');
      arg.push(key);
      arg.push(data.data[key]);
    });

    sql += set.join(',');

    const where = this.parseWhere(data.where);
    sql += where.sql;
    arg.push.apply(arg, where.arg);

    // 判断如果无条件更新，则避免危险操作不执行SQL
    assert(where.sql, '系统自动屏蔽无条件更新！');

    return new Execution(this.command, sql, arg);
  }

  parseDelete(data) {
    let sql = 'delete from ??';
    const arg = [ data.table ];

    const where = this.parseWhere(data.where);
    sql += where.sql;
    arg.push.apply(arg, where.arg);

    // 判断如果无条件删除，则避免危险操作不执行SQL
    assert(where.sql, '系统自动屏蔽无条件删除！');

    return new Execution(this.command, sql, arg);
  }

  parseWhere(data) {
    const result = this.parseConditions(data);
    if (result.sql) {
      result.sql = ' where ' + result.sql;
    }

    return result;
  }

  parseConditions(list) {
    let join = null;
    const arg = [];
    const str = [];

    list.forEach(item => {
      let condition = null;

      // 如果是数组调整查询优先级，比如where (a = 1 or b = 1) and c = 1
      if (Array.isArray(item)) {
        condition = this.parseConditions(item);
        if (condition.sql) {
          condition.sql = '(' + condition.sql + ')';
        }
      } else {
        condition = this.parseConditionItem(item);
      }

      // 如果没有条件则不处理
      if (!condition || !condition.sql) {
        return;
      }

      // 把第一个条件的join作为整体条件的join返回
      if (str.length === 0) {
        join = condition.join;
      } else {
        str.push(condition.join);
      }

      // 拼接条件与参数
      str.push(condition.sql);
      arg.push.apply(arg, condition.arg);
    });

    return { join, sql: str.join(' '), arg };
  }

  parseConditionItem({ field, value, operator, join, ignore }) {
    const reserveHandler = this.config.getIgnore(ignore);
    if (!reserveHandler({ field, value })) {
      return null;
    }

    const operatorHandler = this.config.getOperator(operator);
    const where = operatorHandler({ field, value });
    where.join = join === 'or' ? 'or' : 'and';

    if (!where.arg) {
      where.arg = [];
    }

    if (!where.sql) {
      return null;
    }

    return where;
  }
}

module.exports = MysqlProvider;
