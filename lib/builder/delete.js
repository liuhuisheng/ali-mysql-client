'use strict';

class DeleteBuilder {
  constructor(provider, table) {
    this.provider = provider;
    this.data = {
      table,
      where: [],
    };
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
      .parseDelete(this.data)
      .execute();
  }

  toSql() {
    return this.provider
      .parseDelete(this.data)
      .format();
  }
}

module.exports = DeleteBuilder;
