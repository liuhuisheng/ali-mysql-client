'use strict';

class CustomSqlBuilder {
  constructor(provider, sql, arg) {
    this.provider = provider;
    this.data = {
      sql,
      arg: Array.isArray(arg) ? arg : [],
    };
  }

  params(arg) {
    if (Array.isArray(arg)) {
      this.data.arg = arg;
    }
    return this;
  }

  execute() {
    return this.provider
      .parseCustomSql(this.data)
      .execute();
  }

  toSql() {
    return this.provider
      .parseCustomSql(this.data)
      .format();
  }
}

module.exports = CustomSqlBuilder;
