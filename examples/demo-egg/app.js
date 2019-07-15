'use strict';

const DbClient = require('ali-mysql-client');

module.exports = function(app) {
  const { mysql, mysqlClient } = app.config;

  app.ready(() => {
    // mysql对象直接传入egg-mysql对象，不再传入数据库配置重复创建连接池
    if (mysql.clients) { // 如果支持多实例，则把app.db对象清空，挂在其子节点上
      app.db = {};
      Object.keys(mysql.clients).forEach(key => {
        app.db[key] = new DbClient({
          mysql: app.mysql.get(key),
          config: mysqlClient.config,
        });
      });
    } else { // 单实例的情况下直接挂在app对象上
      app.db = new DbClient({
        mysql: app.mysql,
        config: mysqlClient.config,
      });
    }
  });
};
