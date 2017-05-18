'use strict';

/**
 * Module dependencies.
 */

const async = require('async');
const utils = require('../../utils');
const validator = require('validator');
const userDao = require('../../dao/user');
const officeDao = require('../../dao/office');
const util = require('../../utils');
const menuDao = require('../../dao/menu');
const dictUtil = require('../../utils/dict_utils');
const moment = require('moment');

/**
 * 创建菜单
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
    },
    roles:function(cb){
      userDao.queryRolesForAuth(req,function(err,roles){
        cb(null, roles);
      });
    },
    offices:function(cb){
      officeDao.queryOffice(function(err,offices){
        cb(null, offices);
      });
    }
  }, function (error, result) {

    res.render('manage/user/create', {
      currentMenu:result.currentMenu,
      userTypes:result.userTypes,
      roles:result.roles,
      offices:JSON.stringify(result.offices)
    });
  });
};

/**
 * 编辑用户
 */
exports.edit = function (req, res) {
  let id = req.query.id;

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
    },
    roles:function(cb){
      userDao.queryRolesForAuth(req,function(err,roles){
        cb(null, roles);
      });
    },
    offices:function(cb){
      officeDao.queryOffice(function(err,offices){
        cb(null, offices);
      });
    },
    userInfo:function(cb){
      userDao.queryUserById(id,function(err,user){
        cb(null, user);
      });
    },
    userRoles:function(cb){
      userDao.queryUserRolesById(id,function(err,roles){
        cb(null, roles);
      });
    }
  }, function (error, result) {
    console.log(result.userInfo);
    res.render('manage/user/create', {
      currentMenu:result.currentMenu,
      userTypes:result.userTypes,
      roles:result.roles,
      offices:JSON.stringify(result.offices),
      userInfo:result.userInfo,
      userRoles:result.userRoles
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
  async.auto({
    store: function (cb) {
      let office_id = req.body.office_id;
      let login_name = req.body.login_name;
      let password = req.body.password;
      let no = req.body.no;
      let name = req.body.name;
      let email = req.body.email;
      let phone = req.body.phone;
      let mobile = req.body.mobile;
      let user_type = req.body.user_type;
      let photo = req.body.photo;
      let login_flag = req.body.login_flag;
      let remarks = req.body.remarks;

      //登录名不能重复
      userDao.queryUserByLoginId(login_name,function(err,user){
        if(typeof(user)!='undefined' && user.id!=null){
          cb(null,false);
        }else{
          //有ID就视为修改
          if(typeof(req.body.id)!='undefined' && req.body.id!=''){
            userDao.updateUser(req,function(err,result){
              cb(null,result);
            });
          }else{
            userDao.saveUser(office_id,login_name,password,no,name,email,phone,mobile,user_type,photo,login_flag,remarks,req,function(err,result){
              cb(null,result);
            });
          }
        }
      });
    }
  }, function (error, result) {
    if(result.store){
      res.json({
        result:true
      });
    }else{
      res.json({
        result:false,
        error:'登录名重复请修改登录名'
      });
    }
  });
};

/**
 *  删除一个用户信息
 */
exports.delete = function (req, res) {
  async.auto({
    delUser:function(cb){

      if(req.body.id){
        let id = req.body.id;
        userDao.delUserById(id,function(err,result){
          cb(null,result);
        });
      }else{
        let ids = req.body.ids;
        let idsAry = ids.split('|');

        async.map(idsAry,function(id,idCallBack){
          userDao.delUserById(id,function(err,result){
            idCallBack(null, result);
          });
        }, function(err,result) {
          cb(null,result);
        });
      }
    }
  }, function (error, result) {
    if(result.delUser){
      res.json({
        result:true
      });
    }else{
      res.json({
        result:false
      });
    }
  });
};

exports.index = function (req, res) {
  async.auto({
    currentMenu:function(cb){
        menuDao.queryMenuByHref("/manage/menu",function(err, menu) {
        if (err || !menu) {
          cb(null, {});
        } else{
          cb(null, menu);
        }
      });
    },
    menus:function(cb){
      menuDao.queryMenuForRecursion(function(err,menus){
        cb(null,menus);
      });
    }
  }, function (error, result) {

    res.render('manage/menu/index', {
      currentMenu:result.currentMenu,
      menus:result.menus
    });
  });
};
