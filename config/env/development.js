'use strict';

/**
 * Expose
 */

module.exports = {
  log4js: {
    appenders: [{
        'type': 'console'
      }
    ],
    'replaceConsole': true
  },
  // mysql config
  mysql: {
    server: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'nodejs_demo',
    maxSockets: 80, // pool使用
    timeout: 1, // pool使用
  },
  redis: {
    server: 'localhost',
    // password: 'adminmima',
    port: 6379
  },
  server: {
    coreDomain: '',
    myUrl:'http://server75.x9w.com'
  }
};