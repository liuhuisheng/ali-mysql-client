'use strict';

class UpdateBuilder {
  constructor(provider, table, data) {
    this.provider = provider;
    this.data = {
      table,
      data: data || {},
      where: [],
    };
  }

  column(name, value) {
    this.data.data[name] = value;

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

  execute() {
    return this.provider
      .parseUpdate(this.data)
      .execute();
  }

  toSql() {
    return this.provider
      .parseUpdate(this.data)
      .format();
  }
}

module.exports = UpdateBuilder;
