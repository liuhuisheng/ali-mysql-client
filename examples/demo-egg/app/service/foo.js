'use strict';

module.exports = app => {
  class FooService extends app.Service {
    async getDetail() {
      const result = await app.db.select('*')
        .from('tables')
        .where('table_name', 'tables')
        .queryRow();

      return result;
    }

    async getCount() {
      const result = await app.db.select('count(*)')
        .from('tables')
        .queryValue();

      return result;
    }
  }

  return FooService;
};
