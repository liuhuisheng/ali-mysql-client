'use strict';

const assert = require('assert');
const Rds = require('ali-rds');

function createMysql(options) {
  // 优先从options.mysql中取得配置没到时才从options中取
  assert(options, '初始化参数不能为空！');
  const mysql = options.mysql || options;

  // 如果传入的已经是ali-rds或egg-mysql对象则直接使用
  if (mysql.beginTransaction
    && mysql.query
    && mysql.format
    && mysql.literals) {
    return mysql;
  }

  // 创建一个ali-rds对象
  if (mysql.host
    && mysql.user
    && mysql.password
    && mysql.database) {
    return new Rds(mysql);
  }

  // 测试参数对象
  if (mysql.mock
    && mysql.query
    && mysql.format) {
    return mysql;
  }

  throw new Error('初始化参数不正确！');
}

module.exports = createMysql;
