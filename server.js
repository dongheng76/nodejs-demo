'use strict';

/*
 * nodejs-demo
 * Copyright(c) 2013 Madhusudhan Srinivasa <madhums8@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies
 */
require('./config'); // 载入基本配置文件
const fs = require('fs'); // 文件读写工具包
const join = require('path').join; // 连接字符串方法
const express = require('express'); // express框架
const passport = require('passport'); // 登录认证中间件
const http = require('http'); // 载入http
const models = join(__dirname, 'app/models'); // 取得模块地址
const port = process.env.PORT || 80;
const app = express();

/**
 * Expose
 */

module.exports = app;

// Bootstrap models
fs.readdirSync(models)
  .filter(file => ~file.search(/^[^\.].*\.js$/))
  .forEach(file => require(join(models, file)));

// 启动时加入的 routes
require('./config/express')(app, passport);
require('./config/routes')(app, passport);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * 返回端口信息
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  //初始化端口号
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ?
    'Pipe ' + port :
    'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening () {
  var addr = server.address();
  var bind = typeof addr === 'string' ?
    'pipe ' + addr :
    'port ' + addr.port;
}