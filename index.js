'use strict';

const DbProvider = require('./provider');
const SelectBuilder = require('./builder/select');
const InsertBuilder = require('./builder/insert');
const UpdateBuilder = require('./builder/update');
const DeleteBuilder = require('./builder/delete');

class DbClient {
  constructor(options) {
    this.provider = new DbProvider(options);
    this.literals = this.provider.command.literals;
  }

  select(sql) {
    return new SelectBuilder(this.provider, sql);
  }

  insert(table, data) {
    return new InsertBuilder(this.provider, table, data);
  }

  update(table, data) {
    return new UpdateBuilder(this.provider, table, data);
  }

  delete(table) {
    return new DeleteBuilder(this.provider, table);
  }

  sql(sql, arg) {
    return this.provider.command.execute({ sql, arg });
  }

  useTransaction() {
    const trans = new DbClient(this.provider.command.mysql);
    trans.provider.config.setConfig(this.provider.config);
    return trans.provider.command.useTransaction().then(() => trans);
  }

  commit() {
    return this.provider.command.commit().then(() => this);
  }

  rollback() {
    return this.provider.command.rollback().then(() => this);
  }

  config(config) {
    return this.provider.config.setConfig(config);
  }
}

module.exports = DbClient;
