'use strict';

const { defaultIgnore } = require('./ignore');
const { defaultOperator } = require('./operator');

class Configuration {
  constructor(options) {
    this.operatorMap = {};
    this.ignoreMap = {};
    this.eventSubs = [];

    // 挂载默认值
    defaultIgnore(this);
    defaultOperator(this);

    // 接受初始化参数
    this.setConfig(options.config);
  }

  onBeforeExecute(handler) {
    this.eventSubs.push({ type: 'onBeforeExecute', handler });
  }

  onAfterExecute(handler) {
    this.eventSubs.push({ type: 'onAfterExecute', handler });
  }

  onExecuteError(handler) {
    this.eventSubs.push({ type: 'onExecuteError', handler });
  }

  registerOperator(name, handler) {
    this.operatorMap[name] = handler;
  }

  registerIgnore(name, handler) {
    this.ignoreMap[name] = handler;
  }

  getIgnore(name) {
    if (typeof name === 'function') {
      return name;
    }
    return this.ignoreMap[name] || this.ignoreMap.default;
  }

  getOperator(name) {
    if (typeof name === 'function') {
      return name;
    }
    return this.operatorMap[name] || this.operatorMap.default;
  }

  setConfig(config) {
    if (!config) {
      return this;
    }

    if (typeof config === 'function') {
      config(this);
      return this;
    }

    if (typeof config.config === 'function') {
      config.config(this);
      return this;
    }

    // 创建事务时使用保留项目中配置
    if (config.operatorMap) {
      this.operatorMap = config.operatorMap;
    }

    if (config.ignoreMap) {
      this.ignoreMap = config.ignoreMap;
    }

    if (config.eventSubs) {
      this.eventSubs = config.eventSubs;
    }

    return this;
  }
}

module.exports = Configuration;
