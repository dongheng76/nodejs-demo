'use strict';

/**
 * Module dependencies.
 */
const utils = require('../../utils');
const validator = require('validator');
const dictDao = require('../../dao/sys_dict');
const officeDao = require('../../dao/sys_office');
const util = require('../../utils');
const menuDao = require('../../dao/sys_menu');
const roleDao = require('../../dao/sys_role');
const dictUtil = require('../../utils/dict_utils');
const moment = require('moment');


module.exports = function (app, routeMethod) {
  /**
   * 创建角色
   */
  routeMethod.csurf('/manage/role/create');
  routeMethod.session('/manage/role/create','sys:role:edit');
  app.get('/manage/role/create', function (req, res) {
    Promise.all([
      menuDao.queryMenuByHref('/manage/role'),
      dictUtil.getDictList('sys_data_scope'),
      officeDao.queryOffice(),
      menuDao.queryMenus()
    ]).then(result => {
      res.render('manage/sys_role/create', {
        currentMenu: result[0],
        dataScope: result[1],
        offices: JSON.stringify(result[2]),
        menus: result[3]
      });
    });
  });

  /**
   * 编辑角色
   */
  routeMethod.csurf('/manage/role/edit');
  routeMethod.session('/manage/role/edit','sys:role:edit');
  app.get('/manage/role/edit', function (req, res) {
    let id = req.query.id;

    Promise.all([
      menuDao.queryMenuByHref('/manage/role'),
      dictUtil.getDictList('sys_data_scope'),
      officeDao.queryOffice(),
      menuDao.queryMenus(),
      roleDao.queryRoleById(id),
      roleDao.queryRoleMenusById(id)
    ]).then(result => {
      let menus = result[5];
      let menuIds = '';
      if (typeof (menus) != 'undefined') {
        for (let i = 0; i < menus.length; i++) {
          if (i == menus.length - 1) {
            menuIds += menus[i].id;
          } else {
            menuIds += menus[i].id + ',';
          }
        }
      }

      res.render('manage/sys_role/create', {
        currentMenu: result[0],
        dataScope: result[1],
        offices: JSON.stringify(result[2]),
        menus: result[3],
        role: result[4],
        roleMenus: menuIds
      });
    });
  });
  /**
   *  显示角色详情
   */
  app.all('/manage/role/show', function (req, res) {

  });
  /**
   *  保存一个角色信息
   */
  routeMethod.csurf('/manage/role/store');
  routeMethod.session('/manage/role/store','sys:role:edit');
  app.post('/manage/role/store',async function (req, res) {
    let office_id = req.body.office_id;
    let name = req.body.name;
    let enname = req.body.enname;
    let data_scope = req.body.data_scope;
    let is_sys = req.body.is_sys;
    let useable = req.body.useable;
    let remarks = req.body.remarks;
    let result = null;

    // 有ID就视为修改
    if (typeof (req.body.id) != 'undefined' && req.body.id != '') {
      result = await roleDao.updateRole(req);
      req.session.notice_info = {
        info:'修改角色成功!',
        type:'success'
      };
    } else {
      result = await roleDao.saveRole(office_id, name, enname, data_scope, is_sys, useable, remarks, req);
      req.session.notice_info = {
        info:'保存角色成功!',
        type:'success'
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
        error: '操作失败请重试!'
      });
    }
  });

  /**
   *  删除一个角色信息
   */
  routeMethod.csurf('/manage/role/delete');
  routeMethod.session('/manage/role/delete','sys:role:edit');
  app.post('/manage/role/delete',async function (req, res) {
    let result = null;
    if (req.body.id) {
      let id = req.body.id;
      result = await roleDao.delRoleById(id);

      if (result) {
        req.session.notice_info = {
          info:'感谢您的使用,删除角色成功!',
          type:'success'
        };

        res.json({
          result: true
        });
      } else {
        res.json({
          result: false
        });
      }
    } else {
      let ids = req.body.ids;
      let idsAry = ids.split('|');

      let proIds = idsAry.map(id => {
        return roleDao.delRoleById(id);
      });
      Promise.all(proIds).then(results => {
        req.session.notice_info = {
          info:'感谢您的使用,删除角色成功!',
          type:'success'
        };

        res.json({
          result: true
        });
      });
    }    
  });

  routeMethod.csurf('/manage/role');
  routeMethod.session('/manage/role','sys:role:view');
  app.get('/manage/role', function (req, res) {
    var currentPage = req.query.page ? req.query.page : 1; // 获取当前页数，如果没有则为1

    Promise.all([
      menuDao.queryMenuByHref('/manage/role'),
      roleDao.queryAllRole(req, currentPage, 20),
      roleDao.queryAllRolePage(req, 20, currentPage),
      dictDao.queryDictType(),
      dictUtil.getDictList('sys_data_scope')
    ]).then(result => {
      let roles = result[1];
      let proRoles = roles.map(async role => {
        let dataScopeLabel = await dictUtil.getDictLabel(role.data_scope, 'sys_data_scope', '未知');
        role.data_scope_label = dataScopeLabel;
        role.create_date = moment(role.create_date).format('YYYY-MM-DD HH:mm:ss');
        role.is_sys_label = role.is_sys == 1 ? '是' : '否';
        return role;
      });

      Promise.all(proRoles).then(roles => {
        res.render('manage/sys_role/index', {
          currentMenu: result[0],
          roles: roles,
          page: result[2],
          dictTypes: result[3],
          dataScope: result[4]
        });
      });
      
    });
  });
};