'use strict';


const fs = require('fs'); // 文件读写工具包
const controllersPath = 'app/controllers';
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
 * Expose routes
 */
module.exports = function (app, passport) {
  const pauth = passport.authenticate.bind(passport);

  // 登录相关路由
  require('../app/routes/manage/login')(app, passport);

  // 后台权限部分
  app.use(function (req, res, next) {
    if (req.session.user != undefined) {
      next();
    } else {
      res.redirect('/manage/login');
    }
  });

  /**
   * 自动扫描action添加到路由
   * @param {*string} action 
   */
  var scanControllers = function (action) {
    action = action || '';
    let path = controllersPath;
    if (action) {
      path = controllersPath + action;
    }
    fs.readdirSync(path)
      .forEach(function (file) {
        if (fs.statSync(path + '/' + file).isDirectory()) {
          scanControllers(action + '/' + file);
        } else {
          let controller = require('../' + path + '/' + file);
          for (let method in controller) {
            if (controller.hasOwnProperty(method)) {
              console.log('scanning controller : ' + action + '/' + file.split('.')[0] + '/' + method);
              app.all(action + '/' + file.split('.')[0] + '/' + method, controller[method]);
            }
          }
        }
      });
  };

  scanControllers();

  // 面板路由
  require('../app/routes/manage/panel')(app, passport);
  // 用户路由
  require('../app/routes/manage/user')(app, passport);
  // 文件路由
  require('../app/routes/manage/file')(app, passport);
  // 区域路由
  require('../app/routes/manage/area')(app, passport);
  // 菜单路由
  require('../app/routes/manage/menu')(app, passport);
  // 机构路由
  require('../app/routes/manage/office')(app, passport);
  // 字典路由
  require('../app/routes/manage/dict')(app, passport);
  // 角色路由
  require('../app/routes/manage/role')(app, passport);

  /* app.post('/user/session',
    pauth('local', {
      failureRedirect: '/login',
      failureFlash: 'Invalid email or password.'
    }), user.session);
  app.get('/user/:userId', user.show);
  app.get('/auth/linkedin/callback', pauth('linkedin', fail), user.authCallback);*/

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