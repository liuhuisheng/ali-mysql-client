'use strict';

const DbClient = require('../lib/index');

const mockResult = {
  fieldCount: 0,
  affectedRows: 1,
  insertId: 3710,
  serverStatus: 2,
  warningCount: 2,
  message: '',
  protocol41: true,
  changedRows: 0,
};
const query = jest.fn(() => Promise.resolve(mockResult));
const format = jest.fn(({ sql }) => sql);
const db = new DbClient({ query, format, mock: true });

describe('更新测试', function() {
  it('插入测试对象', async () => {
    const data = {
      name: 'name1',
      type: 'visual',
      tech: 'fusion',
      url: 'https://96.1688.com/123.html',
    };
    const result = await db
      .update('page', data)
      .where('id', 50)
      .execute();

    expect(query).toBeCalledWith(
      'update ?? set ?? = ?,?? = ?,?? = ?,?? = ? where ?? = ?',
      [
        'page',
        'name',
        'name1',
        'type',
        'visual',
        'tech',
        'fusion',
        'url',
        'https://96.1688.com/123.html',
        'id',
        50,
      ]
    );
    expect(result).toBe(mockResult);
  });

  it('插入测试字段', async () => {
    const result = await db
      .update('page')
      .column('name', 'name1')
      .column('type', 'visual')
      .column('tech', 'fusion')
      .where('id', 50)
      .execute();

    expect(query).toBeCalledWith(
      'update ?? set ?? = ?,?? = ?,?? = ? where ?? = ?',
      [ 'page', 'name', 'name1', 'type', 'visual', 'tech', 'fusion', 'id', 50 ]
    );
    expect(result).toBe(mockResult);
  });
});
