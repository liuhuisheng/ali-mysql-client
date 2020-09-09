'use strict';

class SelectBuilder {
  constructor(provider, select) {
    this.provider = provider;
    this.data = {
      select,
      from: '',
      where: [],
      orderby: '',
      groupby: '',
      having: '',
      rows: 0,
      page: 0,
      fromArg: [],
    };
  }

  from(from, arg) {
    if (this.data.form) {
      this.data.form += ' ' + from;
    } else {
      this.data.from = from;
    }

    if (Array.isArray(arg)) {
      this.data.fromArg.push.apply(this.data.fromArg, arg);
    }

    return this;
  }

  join(join, arg) {
    this.data.from += ' ' + join;

    if (Array.isArray(arg)) {
      this.data.fromArg.push.apply(this.data.fromArg, arg);
    }

    return this;
  }

  where(field, value, operator, ignore, join) {
    this.data.where.push(
      typeof field === 'object'
        ? field
        : { field, value, operator, ignore, join }
    );

    return this;
  }

  orderby(orderby) {
    this.data.orderby += orderby;

    return this;
  }

  groupby(groupby) {
    this.data.groupby += groupby;

    return this;
  }

  having(having) {
    this.data.having += having;

    return this;
  }

  queryValue() {
    const data = { ...this.data, page: 1, rows: 1 };
    return this.provider
      .parseSelect(data)
      .execute()
      .then(result => {
        const row = result[0] || {};
        const field = Object.keys(row)[0];
        return row[field];
      });
  }

  queryRow() {
    const data = { ...this.data, page: 1, rows: 1 };
    return this.provider
      .parseSelect(data)
      .execute()
      .then(result => result[0]);
  }

  queryList() {
    return this.provider
      .parseSelect(this.data)
      .execute()
      .then(result => result);
  }

  queryListWithPaging(page = 1, rows = 20) {
    const dataForRows = {
      ...this.data,
      rows,
      page,
    };
    const dataForCount = {
      ...this.data,
      rows: 0,
      page: 0,
      orderby: '',
    };

    // 构造数据列表查询
    const queryRows = this.provider.parseSelect(dataForRows);

    // 构造数据总数量查询，如果有groupby时，count + groupby获取的是多条数据，结果不正确必须再包一层
    let queryTotal = null;
    if (this.data.groupby || this.data.select.toLowerCase().includes('distinct')) {
      queryTotal = this.provider.parseSelect(dataForCount);
      queryTotal.sql = `select count(*) as total from (${queryTotal.sql}) as t`;
    } else {
      dataForCount.select = 'count(*) as total';
      queryTotal = this.provider.parseSelect(dataForCount);
    }

    // 返回分页查询结果
    return Promise.all([
      queryRows.execute(),
      queryTotal.execute(),
    ]).then(values => ({
      total: values[1][0].total,
      rows: values[0],
      pageIndex: Number(page),
      pageSize: Number(rows),
      pageCount: Math.ceil(values[1][0].total / (rows || 1)),
    }));
  }

  toSql() {
    return this.provider
      .parseSelect(this.data)
      .format();
  }
}

module.exports = SelectBuilder;
