'use strict';

module.exports = app => {
  class BarService {
    async getValue() {
      const result = await app.db.select('count(*)')
        .from('tables')
        .queryValue();

      return result;
    }

    async getRow() {
      const result = await app.db.select('*')
        .from('tables')
        .where('table_name', 'TRIGGERS')
        .queryRow();

      return result;
    }

    async getList() {
      const result = await app.db.select('*')
        .from('tables')
        .where('row_format', 'Fixed')
        .queryList();

      return result;
    }

    async getListWithPaging() {
      const result = await app.db.select('*')
        .from('tables')
        .queryListWithPaging(1, 20); // 每页20条，取第一页

      return result;
    }
  }

  return BarService;
};

