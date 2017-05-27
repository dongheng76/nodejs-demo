'use strict';

/**
 * Module dependencies.
 */
const async = require('async');
const utils = require('../../utils');
const menuDao = require('../../dao/menu');
const userDao = require('../../dao/user');

exports.ROUTER = {

  '/sys/user/modifyPwd' : function (req, res) {
    async.auto({
      currentMenu: function (cb) {
        menuDao.queryMenuByHref('/manage/dict', function (err, menu) {
          if (err || !menu) {
            cb(null, false);
          } else {
            cb(null, menu);
          }
        });
      },
    }, function (error, result) {
      res.render('manage/modifyPwd/create', {
        currentMenu: result.currentMenu
       
      });
    });
  },
  /**
   *  修改密码
   */
  '/manage/user/modifyPwd': function (req, res) {
    async.auto({
      store: function (cb) {
       
        let password = req.body.oldpassword;
        let newpassword = req.body.password;
        let loginName = req.session.user.login_name;
         
        // 验证原始密码是否正确
        userDao.queryUserByUserNameAndPwd(loginName, utils.md5(password), function (err, user) {
          if (typeof (user) != 'undefined' && user.id != null) {
            userDao.updateUserPwd(loginName,newpassword, function (err, result) {
              cb(null, result);
            });            
          } else {
              cb(null, false);
            }
        });
      }
    }, function (error, result) {
      if (result.store) {
        res.json({
          result: true
        });
      } else {
        res.json({
          result: false,
          error: '原始密码错误，修改失败'
        });
      }
    });
  }


};




