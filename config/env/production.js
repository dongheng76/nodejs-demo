'use strict';

/**
 * Expose
 */

module.exports = {
  // log files directory
  logDirectory: '/logs/',

  // mysql config
  mysql: {
    server: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'nodejs_demo',
    maxSockets: 80, // pool使用
    timeout: 1, // pool使用
  },
  redis: {
    server: '127.0.0.1',
    // password: 'adminmima',
    port: 6379
  },
  server: {
    coreDomain: '',
    // 微信服务地址
    myUrl:'http://server75.x9w.com'
  }
};