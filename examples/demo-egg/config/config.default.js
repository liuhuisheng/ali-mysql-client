/* eslint-disable no-unused-vars */
'use strict';

exports.keys = 'my secret keys';

// egg-mysql配置
exports.mysql = {
  // 单数据库信息配置
  client: {
    // host
    host: '127.0.0.1',
    // 端口号
    port: '3306',
    // 用户名
    user: 'root',
    // 密码
    password: '12345678',
    // 数据库名
    database: 'information_schema',
  },
  // 是否加载到 app 上，默认开启
  app: true,
  // 是否加载到 agent 上，默认关闭
  agent: false,
};

// @ali/mysql-client配置
exports.mysqlClient = {
  config: config => {
    // 自定义operator
    config.registerOperator('ne', ({ field, value }) => {
      return { sql: '?? <> ?', arg: [ field, value ] };
    });

    // 自定义ignore
    config.registerIgnore('ifNumber', ({ value }) => {
      return !isNaN(Number(value));
    });

    // 监听事件 执行前
    config.onBeforeExecute(function({ sql }) {
      console.log(sql);
    });

    // 监听事件 执行后
    config.onAfterExecute(function({ sql, result }) {
      console.log(result);
    });

    // 监听事件 执行出错
    config.onExecuteError(function({ sql, error }) {
      console.log(error);
    });
  },
};
