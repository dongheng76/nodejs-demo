'use strict';

/**
 * 首先加入需要依赖的模块
 */
const path = require('path');                                 // 读取系统路径模块
const extend = require('util')._extend;                       // 继承并扩展json对象方法
// const dotenv = require('dotenv').config();                    // 载入运行时配置文件
const development = require('./env/development');             // 开发模式环境
const test = require('./env/test');                           // 测试模式环境
const production = require('./env/production');               // 生产模式环境

const notifier = {                                            // 通知类对象
  service: 'postmark',
  APN: false,
  email: true, // true
  actions: ['comment'],
  tplPath: path.join(__dirname, '..', 'app/mailer/templates'),
  key: 'POSTMARK_KEY'
};
const defaults = {                                              // 默认对象
  root: path.join(__dirname, '..'),                             // 项目根目录地址
  notifier: notifier
};

/**
 * Expose
 */

module.exports = {
  development: extend(development, defaults),
  test: extend(test, defaults),
  production: extend(production, defaults)
}[process.env.NODE_ENV || 'development'];