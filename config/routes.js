'use strict';

const join = require('path').join; // 连接字符串方法
const path = join(__dirname, '../app/controllers');
const routeTools = require('./routeTools');
const urlTools = require('url');

/**
 * 添加路由方法以及添加校验方法
 */
~ function () {
  let sessionPermissions = {};
  /**
   * 添加验证session的url地址处理方法
   */
  routeTools.addRouteMethod('session', function (url, ...values) {
    if (!url) {
      throw new Error('permission url is empty');
    }
    if (!values || values.length === 0) {
      throw new Error('url: ' + url + ' permission value is empty');
    }
    sessionPermissions[url] = values.join(',');
  });

  routeTools.addValidateMethod('session', function (req, res) {
    let url = urlTools.parse(req.url).pathname;
    let value = sessionPermissions[url];

    if (!value) {
      return true;
    }
    if (!req.session || !req.session.user || !req.session.menus) {
      return false;
    }
    let values = value.split(',');
    let menus = req.session.menus;
    for (let i = 0; i < menus.length; i++) {
      if (values.includes(menus[i].permission)) {
        return true;
      }
    }

    return false;
  });

  let signPermissions = [];

  routeTools.addRouteMethod('sign', function (url) {
    if (!url) {
      throw new Error('sign url is empty');
    }
    signPermissions.push(url);
  });

  routeTools.addValidateMethod('sign', function (req, res) {
    let url = urlTools.parse(req.url).pathname;
    if (!signPermissions.includes[url]) {
      return true;
    }
    // 需要sign验证 , 验证sign是不是合法
    return true;
  });
}();

/**
 * 校验用户是否具有权限
 * @param {*} req 
 * @param {*} value 
 */
let pageValidate = function (req, value) {
  if (!req.session || !req.session.menus) {
    return false;
  }
  let values = value.split(',');
  let menus = req.session.menus;
  for (let i = 0; i < menus.length; i++) {
    if (values.includes(menus[i].permission)) {
      return true;
    }
  }
  return false;
};

/**
 * Expose routes
 */
module.exports = function (app) {

  // 权限校验拦截
  app.use(function (req, res, next) {
    let result = routeTools.validate(req, res);
    if (result.session && result.sign) {
      // 为页面添加校验属性权限的方法
      res.locals.permission = function (value) {
        return pageValidate(req, value);
      };
      next();
    }
    if (!result.session) {
      if (!req.session || !req.session.user) {
        res.redirect('/manage/login');
      } else {
        res.status(403).render('403');
      }
    }

  });

  routeTools.scan(app, path); // 执行添加路由(这里是个坑,必须先声明权限拦截在执行添加路由,否则无法拦截路由地址)


  /**
   * Error handling
   */
  app.use(function (err, req, res, next) {
    // treat as 404
    if (err.message &&
      (~err.message.indexOf('not found') ||
        (~err.message.indexOf('Cast to ObjectId failed')))) {
      return next();
    }

    console.error(err.stack);

    if (err.stack.includes('ValidationError')) {
      res.status(422).render('422', {
        error: err.stack
      });
      return;
    }

    // error page
    res.status(500).render('500', {
      error: err.stack
    });
  });

  // assume 404 since no middleware responded
  app.use(function (req, res) {
    const payload = {
      url: req.originalUrl,
      error: 'Not found'
    };
    // if (req.accepts('json')) return res.status(404).json(payload);
    res.status(404).render('404', payload);
  });
};