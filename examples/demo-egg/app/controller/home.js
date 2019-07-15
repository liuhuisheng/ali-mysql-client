'use strict';

module.exports = app => {
  class HomeController extends app.Controller {
    async render() {
      const ctx = this.ctx;
      const data = await ctx.service.foo.getDetail();
      ctx.body = 'table表信息: ' + JSON.stringify(data);
    }
  }

  return HomeController;
};
