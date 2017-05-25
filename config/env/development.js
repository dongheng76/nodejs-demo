'use strict';

/**
 * Expose
 */

module.exports = {
  // log files directory
  logDirectory: '/logs/',

  // mysql config
  mysql: {
    server: '118.89.177.58',
    port: 3306,
    user: 'root',
    password: 'dh07019459',
    database: 'nodejs_demo',
    maxSockets: 80, // pool使用
    timeout: 1, // pool使用
  },
  redis: {
    server: '118.89.177.58',
    password: 'adminmima',
    port: 6379
  }
};