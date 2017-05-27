'use strict';

/**
 * Module dependencies.
 */

const express = require('express');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const compression = require('compression');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const csrf = require('csurf');
const cors = require('cors');

const flash = require('connect-flash');
const helpers = require('view-helpers');
const config = require('./');
const pkg = require('../package.json');
const env = process.env.NODE_ENV || 'development';
const envConfig = require('./index');


/**
 * Expose
 */

module.exports = function (app) {

  // default options
  app.use(fileUpload());

  // Compression middleware (should be placed before express.static)
  app.use(compression({
    threshold: 512
  }));

  app.use(cors());

  // 设置静态文件夹路径，已达到不被当成控制层的作用
  app.use(express.static(config.root + '/public'));

  // 输出控制层访问及其读秒库
  app.use(logger('dev'));

  // set views path, template engine and default layout
  app.set('views', config.root + '/app/views');
  app.set('view engine', 'ejs');

  // expose package.json to views
  app.use(function (req, res, next) {
    res.locals.pkg = pkg;
    res.locals.env = env;
    next();
  });

  // bodyParser should be above methodOverride
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(methodOverride(function (req) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      var method = req.body._method;
      delete req.body._method;
      return method;
    }
  }));

  // CookieParser should be above session
  app.use(cookieParser());
  // app.use(cookieSession({ secret: pkg.name }));
  app.use(session({
    resave: false,
    saveUninitialized: true,
    store: new RedisStore({
      host: envConfig.redis.server,
      port: envConfig.redis.port,
      password : envConfig.redis.password
    }),
    secret: pkg.name,
    cookie: { maxAge: 60 * 60 * 1000 }
  }));

  // use passport session
  // app.use(passport.initialize());
  // app.use(passport.session());

  // 每次在进入路由前看看是否有用户或者菜单信息，有就放入locals中
  app.use(function (req, res, next) {
    if (req.session.user != 'undefined') {
      res.locals.user = req.session.user;
    }
    if (req.session.menus != 'undefined') {
      res.locals.menus = req.session.menus;
    }
    if (req.session.sysmenus != 'undefined') {
      res.locals.sysmenus = req.session.sysmenus;
    }
    if (req.session.notice_info != 'undefined') {
      res.locals.notice_info = req.session.notice_info;
      req.session.notice_info = null;
    }
    next();
  });

  // connect flash for flash messages - should be declared after sessions
  app.use(flash());

  // should be declared after session and flash
  app.use(helpers(pkg.name));

  if (env !== 'test') {
    app.use(csrf());

    // This could be moved to view-helpers :-)
    app.use(function (req, res, next) {
      res.locals.csrf_token = req.csrfToken();
      next();
    });
  }

  if (env === 'development') {
    app.locals.pretty = true;
  }
};
