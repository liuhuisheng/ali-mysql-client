'use strict';

const Koa = require('koa');
const app = module.exports = new Koa();

// 加载控制器
const HomeController = require('./app/controller/home')(app);
app.controller = {
  home: new HomeController(),
};

// 加载服务
const FooService = require('./app/service/foo')(app);
const BarService = require('./app/service/bar')(app);
app.service = {
  foo: new FooService(),
  bar: new BarService(),
};

// 初始化路由
app.router = require('./app/router')(app);
app.use(app.router.routes());

// 获取配置信息
const config = app.config = require('./config');
const { mysqlClient, port } = config;

// 初始化数据库
const DbClient = require('ali-mysql-client');
app.db = new DbClient(mysqlClient);

// 启动服务
if (!module.parent) {
  app.listen(port);
  console.log('$ open http://127.0.0.1:' + port);
}
