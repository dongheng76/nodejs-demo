'use strict';

/**
 * Module dependencies.
 */

const async = require('async');
const utils = require('../../utils');
const validator = require('validator');
const userDao = require('../../dao/user');
const logDao = require('../../dao/log');
const session = require('express-session');

/**
 * 登入登录
 * @param req
 * @param res
 */
exports.signin = function (req, res) {
  //取出用户名和密码
  let loginName = req.body.login_name;
  let password = req.body.password;

  let paramsRrror = [];
  //检查用户是否合法
  if (validator.isEmpty(loginName)) {
    paramsRrror.push({ loginName: '登录名不能为空！' });
  }
  if (validator.isEmpty(password)) {
    paramsRrror.push({ password: '密码不能为空！' });
  }

  async.auto({
    user: function (cb) {
      userDao.queryUserByUserNameAndPwd(loginName, utils.md5(password), function (err, user) {
        if (err || !user) {
          res.json({
            result: false,
            error: '你输入的用户名或密码有错误请重试！'
          });
          return;
        } else {
          req.session.user = user;
          cb(null, user);
        }
      });
    },
    //根据用户ID查询用户菜单信息，查询用户角色信息
    menus: ['user', function (params, cb) {
      userDao.queryUserMenuAuthority(params.user.id, function (err, menus) {
        if (err || !menus) {
          cb(null, {});
        } else {
          cb(null, menus);
        }
      });
    }],
    //插入日志信息
    saveLoginLog: ['user', function (params, cb) {
      logDao.saveLog("1", "登录", req, function (err, result) {
        if (err || !result) {
          cb(null, {});
        } else {
          cb(null, result);
        }
      });
    }]
  }, function (error, result) {
    if (paramsRrror.length > 0) {
      res.json(paramsRrror);
      return;
    }

    if (Object.getOwnPropertyNames(result.user).length > 0) {
      req.session.user = result.user;
      req.session.menus = result.menus;
      req.session.sysmenus = JSON.stringify(req.session.menus);

      //如果被匹配上查询用户角色及其菜单信息保存于redis中
      res.json({
        result: true,
        userinfo: result.user
      });
    }
    return;
  });
};

/**
 * Auth callback
 */
exports.authCallback = login;

/**
 * 登录中
 */

exports.login = function (req, res) {
  res.render('manage/login', {
    title: 'Login'
  });
};

/**
 * 注销
 */
exports.signup = function (req, res) {
  console.log('已经删除了');
  delete req.session.user;

  res.json({ result: true });
};

/**
 * Logout
 */
exports.logout = function (req, res) {
  req.logout();
  res.redirect('/login');
};

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
