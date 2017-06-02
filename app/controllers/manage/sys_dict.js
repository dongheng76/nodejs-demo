'use strict';

/**
 * Module dependencies.
 */
const utils = require('../../utils');
const validator = require('validator');
const dictDao = require('../../dao/sys_dict');
const util = require('../../utils');
const menuDao = require('../../dao/sys_menu');
const dictUtil = require('../../utils/dict_utils');
const moment = require('moment');


module.exports = function (app, routeMethod) {
  /**
   * 创建字典
   */
  routeMethod.session('/manage/dict/create','sys:dict:edit');
  app.all('/manage/dict/create', function (req, res) {
    let type = req.query.type;

    Promise.all([
      menuDao.queryMenuByHref('/manage/dict'),
      dictDao.queryMaxSortByType(type)
    ]).then(result => {
      res.render('manage/dict/create', {
        currentMenu: result[0],
        maxSort: parseInt(result[1] ? result[1] : 0) + 10,
        type: type
      });
    });
  });

  /**
   * 编辑字典
   */
  routeMethod.session('/manage/dict/edit','sys:dict:edit');
  app.all('/manage/dict/edit', function (req, res) {
    let id = req.query.id;

    Promise.all([
      menuDao.queryMenuByHref('/manage/dict'),
      dictDao.queryDictById(id),
    ]).then(result => {
      res.render('manage/dict/create', {
        currentMenu: result[0],
        dict: result[1]
      });
    });
  });

  /**
   *  保存一个用户信息
   */
  routeMethod.session('/manage/dict/store','sys:dict:edit');
  app.all('/manage/dict/store',async function (req, res) {
    let value = req.body.value;
    let label = req.body.label;
    let type = req.body.type;
    let sort = req.body.sort;
    let description = req.body.description;
    let remarks = req.body.remarks;
    let result = null;

    // 有ID就视为修改
    if (typeof (req.body.id) != 'undefined' && req.body.id != '') {
      result = await dictDao.updateDict(req);
      req.session.notice_info = {
        info:'修改字典成功!',
        type:'success'
      };
    } else {
      result = await dictDao.saveDict(value, label, type, description, sort, remarks, req);
      req.session.notice_info = {
        info:'保存字典成功!',
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
   *  删除一个字典信息
   */
  routeMethod.session('/manage/dict/delete','sys:dict:edit');
  app.all('/manage/dict/delete',async function (req, res) {
    let result = null;
    if (req.body.id) {
      let id = req.body.id;
      result = await dictDao.delDictById(id);

      if (result) {
        req.session.notice_info = {
          info:'删除字典成功!',
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

      let proIdsAry = idsAry.map(id => {
        return dictDao.delDictById(id);
      });
      Promise.all(proIdsAry).then(results => {
        req.session.notice_info = {
          info:'删除字典成功!',
          type:'success'
        };

        res.json({
          result: true
        });
      });
    }
  });

  routeMethod.session('/manage/dict','sys:dict:show');
  app.all('/manage/dict', function (req, res) {
    let currentPage = req.query.page ? req.query.page : 1; // 获取当前页数，如果没有则为1
    Promise.all([
      menuDao.queryMenuByHref('/manage/dict'),
      dictDao.queryAllDict(req, currentPage, 20),
      dictDao.queryAllDictPage(req, 20, currentPage),
      dictDao.queryDictType()
    ]).then(result => {
      res.render('manage/dict/index', {
        currentMenu: result[0],
        dicts: result[1],
        page: result[2],
        dictTypes: result[3]
      });
    });
  });
};