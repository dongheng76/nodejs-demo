'use strict';

/**
 * Module dependencies.
 */
const utils = require('../../utils');
const validator = require('validator');
const officeDao = require('../../dao/sys_office');
const util = require('../../utils');
const menuDao = require('../../dao/sys_menu');
const areaDao = require('../../dao/sys_area');
const dictUtil = require('../../utils/dict_utils');
const moment = require('moment');
const co = require('co');


module.exports = function (app, routeMethod) {
  /**
   * 创建机构
   */
  routeMethod.csurf('/manage/office/create');
  app.get('/manage/office/create', function (req, res) {
    let pId = req.query.parent_id ? req.query.parent_id : '0';

    Promise.all([
      menuDao.queryMenuByHref('/manage/office'),
      dictUtil.getDictList('sys_office_type'),
      officeDao.queryOfficeById(pId),
      officeDao.queryMaxSortByPId(pId),      
      areaDao.queryAreasByPId('0')
    ]).then(result => {

      res.render('manage/sys_office/create', {
        currentMenu: result[0],
        officeTypes: result[1],
        parentOffice: result[2],
        maxSort: parseInt(result[3] ? result[3] : 0) + 10,
        rootAreas: JSON.stringify(result[4])
      });
    });
  });

  /**
   * 编辑用户
   */
  routeMethod.csurf('/manage/office/edit');
  app.get('/manage/office/edit',async function (req, res) {
    let id = req.query.id;
    let office = await officeDao.queryOfficeById(id);

    Promise.all([
      menuDao.queryMenuByHref('/manage/office'),
      dictUtil.getDictList('sys_office_type'),
      officeDao.queryOfficeById(office.parent_id),
      areaDao.queryAreaGenealById(office.area_id),
      areaDao.queryAreasByPId('0')
    ]).then(result => {
      res.render('manage/sys_office/create', {
        currentMenu: result[0],
        officeTypes: result[1],
        office: office,
        parentOffice: result[2],
        areaName: result[3],
        rootAreas: JSON.stringify(result[4])
      });
    });
  });
  /**
   *  显示用户详情
   */
  app.all('/manage/office/show', function (req, res) {

  });
  /**
   *  保存一个机构信息
   */
  routeMethod.csurf('/manage/office/store');
  app.post('/manage/office/store',async function (req, res) {
    let parent_id = req.body.parent_id;
    let name = req.body.name;
    let area_id = req.body.area_id;
    let type = req.body.type;
    let sort = req.body.sort;
    let master = req.body.master;
    let address = req.body.address;
    let phone = req.body.phone;
    let email = req.body.email;
    let fax = req.body.fax;
    let code = req.body.code;
    let remarks = req.body.remarks;

    // 有ID就视为修改
    let result = null;
    if (typeof (req.body.id) != 'undefined' && req.body.id != '') {
      result = await officeDao.updateOffice(req);
      req.session.notice_info = {
        info:'修改机构成功!',
        type:'success'
      };
    } else {
      result = await officeDao.saveOffice(parent_id, name, sort, area_id, code, type, address, master, phone, fax, email, remarks, req);
      req.session.notice_info = {
        info:'保存机构成功!',
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
   *  删除一个机构信息
   */
  routeMethod.csurf('/manage/office/delete');
  app.post('/manage/office/delete',async function (req, res) {
    let result = null;
    if (req.body.id) {
      let id = req.body.id;
      result = await officeDao.delOfficeById(id);

      if (result) {
        req.session.notice_info = {
          info:'删除机构成功!',
          type:'success'
        };

        res.json({
          result: true
        });
      } else {
        req.session.notice_info = {
          info:'删除机构失败!请重试.',
          type:'fail'
        };

        res.json({
          result: false
        });
      }
    } else {
      req.session.notice_info = {
        info:'删除机构失败!请重试.',
        type:'fail'
      };

      res.json({
        result: false
      });
    }
  });
  routeMethod.csurf('/manage/office');
  app.get('/manage/office', function (req, res) {
    Promise.all([
      menuDao.queryMenuByHref('/manage/office'),
      officeDao.queryOfficeForRecursion()
    ]).then(result => {

      res.render('manage/sys_office/index', {
        currentMenu: result[0],
        offices: result[1]
      });
    });
  });
};