'use strict';

class InsertBuilder {
  constructor(provider, table, data) {
    this.provider = provider;
    this.data = {
      table,
      data: data || {},
    };
  }

  column(name, value) {
    if (Array.isArray(this.data.data)) {
      this.data.data.forEach(item => (item[name] = value));
    } else {
      this.data.data[name] = value;
    }

    return this;
  }

  execute() {
    return this.provider
      .parseInsert(this.data)
      .execute();
  }

  toSql() {
    return this.provider
      .parseInsert(this.data)
      .format();
  }
}

module.exports = InsertBuilder;
