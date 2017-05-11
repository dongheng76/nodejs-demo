'use strict';

/**
 * Module dependencies.
 */

const async = require('async');
const utils = require('../../utils');
const validator = require('validator');
const userDao = require('../../dao/user');
const util = require('../../utils');
const menuDao = require('../../dao/menu');
const dictUtil = require('../../utils/dict_utils');
const moment = require('moment');

/**
 * 创建用户
 */
exports.create = function (req, res) {

  async.auto({
    currentMenu:function(cb){
      menuDao.queryMenuByHref("/manage/user",function(err, menu) {
        if (err || !menu) {
          cb(null, {});
        } else{
          cb(null, menu);
        }
      });
    },
    userTypes:function(cb){
      dictUtil.getDictList('sys_user_type',function(err,userTypes){
        cb(null, userTypes);
      });
    }
  }, function (error, result) {

    res.render('manage/user/create', {
      currentMenu:result.currentMenu,
      userTypes:result.userTypes
    });
  });
};

/**
 *  显示用户详情
 */
exports.show = function (req, res) {

};

/**
 *  保存一个用户信息
 */
exports.store = function (req, res) {

};

/**
 *  删除一个用户信息
 */
exports.delete = function (req, res) {

};

exports.index = function (req, res) {
  var currentPage = req.query.page ? req.query.page : 1; //获取当前页数，如果没有则为1
  async.auto({
    users: function (cb) {
      userDao.queryAllUser(req,currentPage,20,function(err, users) {
        if (err || !users) {
          return;
        } else {
          users.forEach(function (user) {
            dictUtil.getDictLabel(user.user_type,'sys_user_type','未知',function(err,label){
              user.user_type_label = label;
            });
            user.create_date = moment(user.create_date).format("YYYY-MM-DD HH:mm:ss");
          });
          cb(null, users);
        }
      });
    },
    //查询用户数量
    usersPage:['users', function(params,cb){
      userDao.queryAllUserPage(req,20,currentPage,function(err, usersPage) {
        if (err || !usersPage) {
          cb(null, {});
        } else{
          cb(null, usersPage);
        }
      });
    }],
    currentMenu:function(cb){
        menuDao.queryMenuByHref("/manage/user",function(err, menu) {
        if (err || !menu) {
          cb(null, {});
        } else{
          cb(null, menu);
        }
      });
    }
  }, function (error, result) {

    res.render('manage/user/index', {
      currentMenu:result.currentMenu,
      users:result.users,
      page:result.usersPage
    });
  });
};
