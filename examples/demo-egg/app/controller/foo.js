'use strict';

module.exports = app => {
  class FooController extends app.Controller {
    async render() {
      const ctx = this.ctx;
      const count = await this.service.foo.getCount();
      ctx.body = '表的数量：' + count;
    }
  }

  return FooController;
};
