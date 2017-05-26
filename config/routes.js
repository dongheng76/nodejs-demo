'use strict';
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

const join = require('path').join; // 连接字符串方法
const path = join(__dirname, '../app/controllers');
const routeTools = require('./routeTools');

/**
 * Expose routes
 */
module.exports = function (app) {

  // 权限校验拦截
  app.use(function (req, res, next) {
    let result = routeTools.validate(req);
    if (result === 'success') {
      next();
      return;
    }
    if (result === 'session') {
      res.redirect('/manage/login');
      return;
    }
    if (result === 'sign') {
      res.res.json({
        result: 403,
        message: 'You are not permitted'
      });
      return;
    }
  });

  routeTools.scan(app, path); // 执行添加路由(这里是个坑,必须先声明权限拦截在执行添加路由,否则无法拦截路由地址)

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