'use strict';

const co = require('co');
const assert = require('assert');
const createMysql = require('./factory');

class DbCommand {
  constructor(options, config) {
    this.mysql = createMysql(options);
    this.literals = this.mysql.literals;
    this.config = config;
    this.trans = null;
  }

  useTransaction() {
    const command = this;
    return co(function* () {
      command.useTrans = true;
      command.trans = yield command.mysql.beginTransaction();
    });
  }

  commit() {
    const command = this;
    return co(function* () {
      if (command.trans) {
        yield command.trans.commit();
        command.trans = null;
      }
    });
  }

  rollback() {
    const command = this;
    return co(function* () {
      if (command.trans) {
        yield command.trans.rollback();
        command.trans = null;
      }
    });
  }

  execute({ sql, arg }) {
    if (this.useTrans) {
      assert(this.trans, '事务已结束！');
    }

    const command = this;
    const handlerArg = {
      sql,
      sql_data: arg,
      sql_text: sql,
      mysql: command.mysql,
    };

    return co(function* () {
      try {
        // 执行前处理
        handlerArg.sql = command.mysql.format(sql, arg);
        command.handleEvent('onBeforeExecute', handlerArg);

        // 执行sql
        const result = yield (command.trans || command.mysql).query(sql, arg);

        // 执行后处理
        handlerArg.result = result;
        command.handleEvent('onAfterExecute', handlerArg);

        return result;
      } catch (e) {
        // 执行出错处理
        handlerArg.error = e;
        command.handleEvent('onExecuteError', handlerArg);
        throw e;
      }
    });
  }

  handleEvent(type, arg) {
    const list = this.config.eventSubs.filter(item => item.type === type && typeof item.handler === 'function');
    list.map(item => item.handler(arg));
  }
}

module.exports = DbCommand;
