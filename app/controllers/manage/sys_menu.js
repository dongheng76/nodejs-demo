'use strict';

/**
 * Module dependencies.
 */
const utils = require('../../utils');
const validator = require('validator');
const util = require('../../utils');
const menuDao = require('../../dao/sys_menu');
const dictUtil = require('../../utils/dict_utils');
const moment = require('moment');

module.exports = function (app, routeMethod) {
  /**
   * 创建菜单
   */
  routeMethod.csurf('/manage/menu/create');
  routeMethod.session('/manage/menu/create','sys:menu:edit');
  app.get('/manage/menu/create', function (req, res) {
    let pId = req.query.parent_id ? req.query.parent_id : '1';

    Promise.all([
      menuDao.queryMenuByHref('/manage/menu'),
      menuDao.queryMenus(),
      menuDao.querySortMaxByPId(pId),
      menuDao.queryMenuById(pId)
    ]).then(result => {
      res.render('manage/sys_menu/create', {
        currentMenu: result[0],
        selectMenus: JSON.stringify(result[1]),
        maxSort: parseInt(result[2] ? result[2] : 0) + 10,
        menuParent: result[3]
      });
    });
  });

  /**
   * 编辑用户
   */
  routeMethod.session('/manage/menu/edit','sys:menu:edit');
  routeMethod.csurf('/manage/menu/edit');
  app.get('/manage/menu/edit',async function (req, res) {
    let id = req.query.id;
    let menu = await menuDao.queryMenuById(id);

    Promise.all([
      menuDao.queryMenuByHref('/manage/menu'),
      menuDao.queryMenuById(menu.parent_id),
      menuDao.queryMenuById(id)
    ]).then(result => {
      res.render('manage/sys_menu/create', {
        currentMenu: result[0],
        menuParent: result[1],
        menu: menu
      });
    });
  });

  /**
   *  显示用户详情
   */
  app.all('/manage/menu/show', function (req, res) {

  });

  /**
   *  保存一个菜单信息
   */
  routeMethod.session('/manage/menu/store','sys:menu:edit');
  routeMethod.csurf('/manage/menu/store');
  app.post('/manage/menu/store',async function (req, res) {
    let parent_id = req.body.parent_id;
    let name = req.body.name;
    let sort = req.body.sort;
    let href = req.body.href;
    let icon = req.body.icon;
    let permission = req.body.permission;
    let remarks = req.body.remarks;
    let result = null;

    // 有ID就视为修改
    if (typeof (req.body.id) != 'undefined' && req.body.id != '') {
      result = await menuDao.updateMenu(req);
      req.session.notice_info = {
        info:'修改菜单成功!',
        type:'success'
      };
    } else {
      result = await menuDao.saveMenu(parent_id, name, sort, href, icon, permission, remarks, req);
      req.session.notice_info = {
        info:'保存菜单成功!',
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
        error: '网络异常请重试！'
      });
    }
  });

  /**
   *  删除一个菜单信息
   */
  routeMethod.session('/manage/menu/delete','sys:menu:edit');
  routeMethod.csurf('/manage/menu/delete');
  app.post('/manage/menu/delete',async function (req, res) {
    let result = null;

    if (typeof (req.body.id) != 'undefined') {
      let id = req.body.id;
      result = await menuDao.delMenuById(id);
    } else {
      req.session.notice_info = {
        info:'请传入正确的参数!',
        type:'fail'
      };
      res.json({
        result: false
      });
      return;
    }

    if (result) {
      req.session.notice_info = {
        info:'删除菜单成功!',
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
  });
  
  routeMethod.session('/manage/menu','sys:menu:view');
  routeMethod.csurf('/manage/menu');
  app.get('/manage/menu', function (req, res) {
    Promise.all([
      menuDao.queryMenuByHref('/manage/menu'),
      menuDao.queryMenuForRecursion()
    ]).then(result => {
      res.render('manage/sys_menu/index', {
        currentMenu: result[0],
        menus: result[1]
      });
    });
  });
};