'use strict';

/**
 * Module dependencies.
 */
const utils = require('../../utils');
const validator = require('validator');
const userDao = require('../../dao/sys_user');
const logDao = require('../../dao/sys_log');


module.exports = function (app, routeMethod) {
  /**
   * 登入登录
   * @param req
   * @param res
   */
  app.all('/manage/signin', function (req, res) {
    // 取出用户名和密码
    let loginName = req.body.login_name;
    let password = req.body.password;

    let paramsRrror = [];
    // 检查用户是否合法
    if (validator.isEmpty(loginName)) {
      paramsRrror.push({
        loginName: '登录名不能为空！'
      });
    }
    if (validator.isEmpty(password)) {
      paramsRrror.push({
        password: '密码不能为空！'
      });
    }

    userDao.queryUserByUserNameAndPwd(loginName, utils.md5(password)).then((user) => {
      req.session.user = user;

      Promise.all([
        userDao.queryUserMenuAuthority(user.id),
        logDao.saveLog('1', '登录', req)
      ]).then(result => {
        if (paramsRrror.length > 0) {
          res.json(paramsRrror);
          return;
        }

        if (user) {
          req.session.user = user;
          req.session.menus = result[0];
          req.session.sysmenus = JSON.stringify(req.session.menus);

          // 如果被匹配上查询用户角色及其菜单信息保存于redis中
          res.json({
            result: true,
            userinfo: user
          });
        }
      });
    }).catch(err => {
      console.log(err);
    });
  });

  /**
   * 登录
   */
  app.get('/manage/login', function (req, res) {
    res.render('manage/login', {
      title: 'Login'
    });
  });

  /**
   * 注销
   */
  app.all('/manage/signup', function (req, res) {
    req.session.destroy(function (err) {
      // cannot access session here
      if (err) console.log(err);
    });

    res.json({
      result: true
    });
  });
  /**
   * Logout
   */
  app.all('/manage/logout', function (req, res) {
    req.logout();
    res.redirect('/login');
  });
};

/**
 * Auth callback
 */
exports.authCallback = login;

/**
 * Session
 */

exports.session = login;

/**
 * Login
 */

function login(req, res) {
  const redirectTo = req.session.returnTo ? req.session.returnTo : '/';
  delete req.session.returnTo;
  res.redirect(redirectTo);
}