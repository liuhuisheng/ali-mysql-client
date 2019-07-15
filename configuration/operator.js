'use strict';

exports.defaultOperator = function(config) {
  config.registerOperator('default', ({ field, value }) => ({
    sql: '?? = ?',
    arg: [ field, value ],
  }));

  config.registerOperator('eq', ({ field, value }) => ({
    sql: '?? = ?',
    arg: [ field, value ],
  }));

  config.registerOperator('ne', ({ field, value }) => ({
    sql: '?? <> ?',
    arg: [ field, value ],
  }));

  config.registerOperator('in', ({ field, value }) => {
    const arr = typeof value === 'string' ? value.split(',') : value;
    if (arr.length) {
      return {
        sql: '?? in (?)',
        arg: [ field, arr ],
      };
    } // 如果数组为空时查询会报语法错误，此时直接返回false条件
    return {
      sql: '1 <> 1',
      arg: [],
    };

  });

  config.registerOperator('gt', ({ field, value }) => ({
    sql: '?? > ?',
    arg: [ field, value ],
  }));

  config.registerOperator('ge', ({ field, value }) => ({
    sql: '?? >= ?',
    arg: [ field, value ],
  }));

  config.registerOperator('lt', ({ field, value }) => ({
    sql: '?? < ?',
    arg: [ field, value ],
  }));

  config.registerOperator('le', ({ field, value }) => ({
    sql: '?? <= ?',
    arg: [ field, value ],
  }));

  config.registerOperator('isnull', ({ field }) => ({
    sql: '?? is null',
    arg: [ field ],
  }));

  config.registerOperator('isnotnull', ({ field }) => ({
    sql: '?? is not null',
    arg: [ field ],
  }));

  config.registerOperator('like', ({ field, value }) => ({
    sql: '?? like ?',
    arg: [ field, '%' + value + '%' ],
  }));

  config.registerOperator('startwith', ({ field, value }) => ({
    sql: '?? like ?',
    arg: [ field, value + '%' ],
  }));

  config.registerOperator('endwith', ({ field, value }) => ({
    sql: '?? like ?',
    arg: [ field, '%' + value ],
  }));

  config.registerOperator('between', ({ field, value }) => ({
    sql: '?? between ? and ?',
    arg: [ field, value[0], value[1] ],
  }));

  config.registerOperator('findinset', ({ field, value }) => ({
    sql: 'find_in_set(?, ??)',
    arg: [ Array.isArray(value) ? value.join(',') : value, field ],
  }));

  config.registerOperator('insetfind', ({ field, value }) => ({
    sql: 'find_in_set(??, ?)',
    arg: [ field, Array.isArray(value) ? value.join(',') : value ],
  }));

  // 条件子查询
  // 示例：where('a.id in (select component_id from rocms_component_pool_detail where pool_id = ? )', [ query.id ], 'sql')
  config.registerOperator('sql', ({ field, value }) => {
    return { sql: field, arg: value };
  });

  // 关键词查询 支持关键词分词 a b 及 a|b（空格分隔and 竖线分隔or）
  // 示例：where('a.name,a.description,a.tags,b.name,b.tagname', query.keywords, 'keywords', 'ifHave') 关键字在这些字段中模糊查询
  config.registerOperator('keywords', ({ field, value }) => {
    const segOr = /\|/g;
    const segAnd = /\s+|\+|,/g;
    const input = String(value || '').trim().replace(/s*\|s*/g, '|');

    // 默认使用and连接
    let join = 'and';
    let arr = input.split(segAnd).filter(s => s.trim());

    // 满足条件则使用or连接
    const arrOr = input.split(segOr).filter(s => s.trim());
    if (arrOr.length > arr.length) {
      join = 'or';
      arr = arrOr;
    }

    // 取得每一个条件的sql
    const arg = [];
    const sqls = arr.map(s => {
      const sql = [];
      field.split(',').forEach(item => {
        sql.push('?? like ?');
        arg.push(item, `%${s.trim()}%`);
      });
      return `(${sql.join(' or ')})`;
    });

    return { sql: `(${sqls.join(` ${join} `)})`, arg };
  });
};
