/* eslint-disable no-unused-vars */
'use strict';

module.exports = app => {
  class HomeController {
    async index(ctx, next) {
      const result = await app.service.foo.getDetail();
      ctx.body = 'tables表信息' + JSON.stringify(result);
    }

    async foo(ctx, next) {
      const result = await app.service.foo.getCount();
      ctx.body = '表数量：' + result;
    }
  }

  return HomeController;
};
