'use strict';

const Router = require('koa-router');

module.exports = app => {
  const router = new Router();
  router.get('/', app.controller.home.index);
  router.get('/foo', app.controller.home.foo);

  return router;
};
