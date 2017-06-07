'use strict';

/**
 * Expose
 */

module.exports = {
  log4js: {
    appenders: [{
        'type': 'console'
      },
      {
        'type': 'dateFile',
        'filename': 'logs/access.log',
        'pattern': '-yyyy-MM-dd',
        'alwaysIncludePattern': true,
        'category': 'http'
      },
      {
        'type': 'file',
        'filename': 'logs/logs.log',
        'maxLogSize': 10485760,
        'numBackups': 10
      },
      {
        'type': 'dateFile',
        'filename': 'logs/date.log',
        'pattern': '-yyyy-MM-dd',
        'alwaysIncludePattern': true
      },
      {
        'type': 'logLevelFilter',
        'level': 'error',
        'appender': {
          'type': 'file',
          'filename': 'logs/errors.log'
        }
      }
    ],
    'replaceConsole': true
  },
  // mysql config
  mysql: {
    server: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'dh07019459',
    database: 'nodejs_demo',
    maxSockets: 80, // pool使用
    timeout: 1, // pool使用
  },
  redis: {
    server: '127.0.0.1',
    password: 'adminmima',
    port: 6379
  }
};