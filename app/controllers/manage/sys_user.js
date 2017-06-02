'use strict';

/**
 * Module dependencies.
 */
const validator = require('validator');
const userDao = require('../../dao/sys_user');
const officeDao = require('../../dao/sys_office');
const menuDao = require('../../dao/sys_menu');
const dictUtil = require('../../utils/dict_utils');
const moment = require('moment');


module.exports = function (app, routeMethod) {

  /**
   * 创建用户
   */
  app.all('/manage/user/create', function (req, res) {
    Promise.all([
      menuDao.queryMenuByHref('/manage/user'),
      dictUtil.getDictList('sys_user_type'),
      userDao.queryRolesForAuth(req),
      officeDao.queryOffice()
    ]).then(result => {
      res.render('manage/user/create', {
        currentMenu: result[0],
        userTypes: result[1],
        roles: result[2],
        offices: JSON.stringify(result[3])
      });
    });
  });
  /**
   * 编辑用户
   */
  app.all('/manage/user/edit', function (req, res) {
    let id = req.query.id;

    Promise.all([
      menuDao.queryMenuByHref('/manage/user'),
      dictUtil.getDictList('sys_user_type'),
      userDao.queryRolesForAuth(req),
      officeDao.queryOffice(),
      userDao.queryUserById(id),
      userDao.queryUserRolesById(id)
    ]).then(result => {
      res.render('manage/user/create', {
        currentMenu: result[0],
        userTypes: result[1],
        roles: result[2],
        offices: JSON.stringify(result[3]),
        userInfo: result[4],
        userRoles: result[5]
      });
    });
  });
  /**
   *  显示用户详情
   */
  app.all('/manage/user/show', function (req, res) {

  });
  /**
   *  保存一个用户信息
   */
  app.all('/manage/user/store', async function (req, res) {
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

    // 登录名不能重复
    let user = await userDao.queryUserByLoginId(login_name);

    if (typeof (user) != 'undefined' && user.id != null) {
      res.json({
        result: false,
        error: '登录名重复请修改登录名'
      });
    } else {
      let result = null;
      // 有ID就视为修改
      if (typeof (req.body.id) != 'undefined' && req.body.id != '') {
        result = await userDao.updateUser(req);
        req.session.notice_info = {
          info: '修改用户成功!',
          type: 'success'
        };
      } else {
        result = await userDao.saveUser(office_id, login_name, password, no, name, email, phone, mobile, user_type, photo, login_flag, remarks, req);
        req.session.notice_info = {
          info: '保存用户成功!',
          type: 'success'
        };
      }
      if (result) {
        res.json({
          result: true
        });
      } else {
        req.session.notice_info = null;

        res.json({
          result: false,
          error: '网络出现问题请重试!'
        });
      }
    }


  });
  /**
   *  删除一个用户信息
   */
  app.all('/manage/user/delete', async function (req, res) {
    if (req.body.id) {
      let id = req.body.id;
      let result = userDao.delUserById(id);
      if (result) {
        req.session.notice_info = {
          info: '删除用户成功!',
          type: 'success'
        };

        res.json({
          result: true
        });
      } else {
        req.session.notice_info = {
          info: '删除用户失败请重试!',
          type: 'fail'
        };

        res.json({
          result: false
        });
      }
    } else {
      let ids = req.body.ids;
      let idsAry = ids.split('|');

      let promiseIds = idsAry.map(id => {
        return userDao.delUserById(id);
      });

      Promise.all(promiseIds).then(() => {
        res.json({
          result: true
        });
      });
    }
  });

  app.all('/manage/user', function (req, res) {
    var currentPage = req.query.page ? req.query.page : 1; // 获取当前页数，如果没有则为1

    Promise.all([
      userDao.queryAllUser(req, currentPage, 20),
      // 查询用户数量
      userDao.queryAllUserPage(req, 20, currentPage),
      menuDao.queryMenuByHref('/manage/user')
    ]).then(async result => {
      let users = result[0];
      let proUsers = users.map(async user => {
        user.create_date = moment(user.create_date).format('YYYY-MM-DD HH:mm:ss');
        user.user_type_label = await dictUtil.getDictLabel(user.user_type, 'sys_user_type', '未知');
        return user;
      });

      Promise.all(proUsers).then(results => {
        res.render('manage/user/index', {
          currentMenu: result[2],
          users: users,
          page: result[1],
          condition: req.query
        });
      });
    });
  });
};