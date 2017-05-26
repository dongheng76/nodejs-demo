'use strict';

/**
 * 文件读写工具包
 */
const fs = require('fs');
const join = require('path').join; // 连接字符串方法__dirname
/*
 * Module dependencies.
 */
const auth = require('./middlewares/authorization');
/**
 * Route middlewares
 */
const articleAuth = [auth.requiresLogin, auth.article.hasAuthorization];
const commentAuth = [auth.requiresLogin, auth.comment.hasAuthorization];

const fail = {
  failureRedirect: '/login'
};

/**
 * 提供自动扫描路由和添加自定义路由功能
 * @param {*string} action 
 */
let Routes = function (app) {
  let path = join(__dirname, '../app/controllers');
  let methods = {};
  /**
   * 添加特殊路由
   * @param {*string} routeUrl 路由地址
   * @param {*string} methodPath /app/controllers开始的方法路径
   */
  this.use = function (routeUrl, methodPath) {
    console.log('custom route : ' + routeUrl);
    app.all(routeUrl, methods[methodPath]);
  };
  let scan = function (action) {
    action = action || '';
    action && (path += action);
    fs.readdirSync(path)
      .forEach((file) => {
        if (fs.statSync(path + '/' + file).isDirectory()) {
          scan(action + '/' + file);
        } else {
          let controller = require(path + '/' + file);
          for (let method in controller) {
            if (controller.hasOwnProperty(method)) {
              var routeUrl = action + '/' + file.split('.')[0] + '/' + method;
              methods[routeUrl] = controller[method];
              console.log('scanning route : ' + routeUrl);
              app.all(routeUrl, controller[method]);
            }
          }
        }
      });
  };
  console.log('scanning route start...');
  scan();
  console.log('scanning route end...');
};
/**
 * 管理后台权限处理
 */
let Permission = function () {
  let include = [];
  let exclude = [];
  /**
   * 添加校验权限的路径
   * @param {*string} path 包含权限校验的路径
   */
  this.include = function (...path) {
    include = include.concat(path);
  };
  /**
   * 排除校验权限的路径
   * @param {*string} path 包含权限校验的开始路径
   */
  this.exclude = function (...path) {
    exclude = exclude.concat(path);
  };
  /**
   * 验证url是否需要校验
   * @param {string} url 要验证的访问地址
   * @returns {boolean} true 需要,false 不需要
   */
  this.check = function (url) {
    for (let i = 0; i < exclude.length; i++) {
      let patten = new RegExp('^' + exclude[i], 'i');
      if (patten.test(url)) {
        return false;
      }
    }
    for (let i = 0; i < include.length; i++) {
      let patten = new RegExp('^' + include[i], 'i');
      if (patten.test(url)) {
        return true;
      }
    }
    return false;
  };
};

/**
 * Expose routes
 */
module.exports = function (app, passport) {
  // 权限校验对象
  let permission = new Permission();
  permission.include('/manage');
  permission.exclude('/manage/login', '/manage/signin');
  // 权限校验拦截
  app.use(function (req, res, next) {
    let user = req.session.user;
    let url = req.originalUrl;
    if (permission.check(url)) {
      if (!user) { // 用户未登录
        res.redirect('/manage/login');
        return;
      }
    }
    next();
  });

  // 自动扫描路由
  var routes = new Routes(app);
  // 添加特殊路由
  routes.use('/manage/panel', '/manage/panel/index');
  routes.use('/manage/user', '/manage/user/index');
  routes.use('/manage/file', '/manage/file/index');
  routes.use('/manage/area', '/manage/area/index');
  routes.use('/manage/menu', '/manage/menu/index');
  routes.use('/manage/office', '/manage/office/index');
  routes.use('/manage/dict', '/manage/dict/index');
  routes.use('/manage/log', '/manage/log/index');
  routes.use('/manage/role', '/manage/role/index');
  routes.use('/manage/login', '/manage/login/login');
  routes.use('/manage/signin', '/manage/login/signin');
  routes.use('/manage/signup', '/manage/login/signup');
  routes.use('/manage/logout', '/manage/login/logout');

  // // 面板路由
  // require('../app/routes/manage/panel')(app, passport);
  // // 用户路由
  // require('../app/routes/manage/user')(app, passport);
  // // 文件路由
  // require('../app/routes/manage/file')(app, passport);
  // // 区域路由
  // require('../app/routes/manage/area')(app, passport);
  // // 菜单路由
  // require('../app/routes/manage/menu')(app, passport);
  // // 机构路由
  // require('../app/routes/manage/office')(app, passport);
  // // 字典路由
  // require('../app/routes/manage/dict')(app, passport);
  // // 角色路由
  // require('../app/routes/manage/role')(app, passport);

  // app.post('/user/session',
  //   pauth('local', {
  //     failureRedirect: '/login',
  //     failureFlash: 'Invalid email or password.'
  //   }), user.session);
  // app.get('/user/:userId', user.show);
  // app.get('/auth/linkedin/callback', pauth('linkedin', fail), user.authCallback);

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