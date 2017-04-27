'use strict';

/**
 * Module dependencies.
 */

const async = require('async');
const respond = require('../../utils/index');
const mysqldb = require('../../../config/mysql_db');
const md5 = require('md5');
const validator = require('validator');
/**
 * Load
 */

exports.load = function (req, res, next) {
  try {

  } catch (err) {
    return next(err);
  }
  next();
};

/**
 * Create user
 */

exports.create = function (req, res) {

  try {

  } catch (err) {

  }
};

/**
 *  Show profile
 */

exports.show = function (req, res) {

};

exports.signin = function (req, res) {
  //取出用户名和密码
  let login_name = req.body.login_name;
  let password = req.body.password;

  let params_error = [];
  //检查用户是否合法
  if(validator.isEmpty(login_name)){
    error.push({loginname:'登录名不能为空！'});
  }
  if(validator.isEmpty(password)){
    error.push({loginname:'密码不能为空！'});
  }

  async.series({
    queryUserByUserNameAndPwd: function (done) {
      let sql = "select * from sys_user where login_name=? and password=? ";

      mysqldb.query(sql,[login_name,md5(password)], function(err, rows, fields){
        if (err) {
          console.log(err);
          return;
        }
        done(null, rows);
      });
    }
  }, function (error, result) {
    if(params_error.length>0){
      res.json(params_error);
      return ;
    }

    let user = result.queryUserByUserNameAndPwd;
    console.log(user);
    if(user.length>0){
      //如果被匹配上查询用户角色及其菜单信息保存于redis中
      res.json({
        result:true,
        userinfo:user[0]
      });
    }else{
      res.json({
        result:false,
        error:'你输入的用户名或密码有错误请重试！'
      });
    }
  });
};

/**
 * Auth callback
 */
exports.authCallback = login;

/**
 * Show login form
 */

exports.login = function (req, res) {
  res.render('manage/login', {
    title: 'Login'
  });
};

/**
 * Show sign up form
 */

exports.signup = function (req, res) {
  res.render('users/signup', {
    title: 'Sign up',
    user: new User()
  });
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

function login (req, res) {
  const redirectTo = req.session.returnTo? req.session.returnTo : '/';
  delete req.session.returnTo;
  res.redirect(redirectTo);
}
