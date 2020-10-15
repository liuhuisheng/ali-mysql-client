'use strict';

const DbClient = require('../lib/index');

const mockResult = {
  fieldCount: 0,
  affectedRows: 1,
  serverStatus: 2,
  warningCount: 2,
  message: '',
  protocol41: true,
  changedRows: 0,
};
const query = jest.fn(() => Promise.resolve(mockResult));
const beginTransaction = jest.fn(() => {});
const db = new DbClient({ query, beginTransaction });

describe('自定义SQL测试', function() {
  it('自定义SQL测试', async () => {
    const result1 = await db
      .sql('select * from page where id = ?')
      .params([ 50 ])
      .execute();

    const result2 = await db
      .sql('select * from page where id = ?')
      .params([ 50 ])
      .toSql();

    expect(query).toBeCalledWith('select * from page where id = 50', []);
    expect(result1).toBe(mockResult);
    expect(result2).toBe('select * from page where id = 50');
  });
});
