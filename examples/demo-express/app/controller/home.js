'use strict';

module.exports = app => {
  class HomeController {
    async index(req, res) {
      const result = await app.service.foo.getDetail();
      res.send('tables表信息' + JSON.stringify(result));
    }

    async foo(req, res) {
      const result = await app.service.foo.getCount();
      res.send('表数量：' + result);
    }
  }

  return HomeController;
};
