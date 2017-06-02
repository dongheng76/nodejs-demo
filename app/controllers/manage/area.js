'use strict';

/**
 * Module dependencies.
 */
const async = require('async');
const validator = require('validator');
const menuDao = require('../../dao/menu');
const areaDao = require('../../dao/area');
const dictUtil = require('../../utils/dict_utils');


module.exports = function (app, routeMethod) {

  app.all('/manage/area', function (req, res) {
    Promise.all([
      areaDao.queryAreasByPId('0'),
      menuDao.queryMenuByHref('/manage/area')
    ]).then(result => {
      let areas = result[0];
      res.render('manage/area/index', {
        currentMenu: result[1],
        areas: JSON.stringify(areas)
      });
    });
  });

  app.all('/manage/area/findareabypid',async function (req, res) {
      let areas = await areaDao.queryAreasByPId(req.body.parent_id);
      res.json(areas);
  });

  app.all('/manage/area/create', function (req, res) {
    Promise.all([
      menuDao.queryMenuByHref('/manage/area'),
      dictUtil.getDictList('sys_area_type'),
      areaDao.queryAreaById(req.query.parent_id),
      areaDao.queryChildrenMaxSort(req.query.parent_id)
    ]).then(result => {
      res.render('manage/area/create', {
        currentMenu: result[0],
        areaTypes: result[1],
        parentAreaInfo: result[2],
        currentSort: parseInt(result[3] ? result[3] : 0) + 10
      });
    });
  });

  /**
   *  保存一个区域信息
   */
  app.all('/manage/area/store', function (req, res) {
    let parent_id = req.body.parent_id;
    let name = req.body.name;
    let sort = req.body.sort;
    let code = req.body.code;
    let type = req.body.type;
    let remarks = req.body.remarks;
    let result = null;

    // 有ID就视为修改
    if (typeof (req.body.id) != 'undefined' && req.body.id != '') {
      result = areaDao.updateArea(req);
      req.session.notice_info = {
        info:'修改区域成功!',
        type:'success'
      };
    } else {
      result = areaDao.saveArea(parent_id, name, sort, code, type, remarks, req);
      req.session.notice_info = {
        info:'保存区域成功!',
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
   * 编辑区域
   */
  app.all('/manage/area/edit',async function (req, res) {
    let id = req.query.id;
    let area = await areaDao.queryAreaById(id);

    Promise.all([
      menuDao.queryMenuByHref('/manage/area'),
      dictUtil.getDictList('sys_area_type'),
      areaDao.queryAreaById(area.parent_id)
    ]).then(result => {
      res.render('manage/area/create', {
        currentMenu: result[0],
        areaTypes: result[1],
        area: area,
        parentAreaInfo: result[2]
      });
    });
  });

  /**
   *  删除一个用户信息
   */
  app.all('/manage/area/delete',async function (req, res) {
    let id = req.body.id;
    let result = await areaDao.delAreaById(id);

    if (result) {
        res.json({
          result: true
        });
      } else {
        res.json({
          result: false
        });
      }
  });
};