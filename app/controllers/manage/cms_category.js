'use strict';

/**
 * Module dependencies.
 */
const utils = require('../../utils');
const validator = require('validator');
const dictDao = require('../../dao/sys_dict');
const siteDao = require('../../dao/cms_site');
const cateDao = require('../../dao/cms_category');
const util = require('../../utils');
const menuDao = require('../../dao/sys_menu');
const dictUtil = require('../../utils/dict_utils');
const moment = require('moment');


module.exports = function (app, routeMethod) {
  /**
   * 创建栏目分类
   */
  routeMethod.session('/manage/cms_category/create','cms:cms_category:edit');
  app.all('/manage/cms_category/create', function (req, res) {
    let pId = req.query.parent_id ? req.query.parent_id : '0';
    let site_id = req.session.site_id ? req.session.site_id : '1';
    Promise.all([
      menuDao.queryMenuByHref('/manage/cms_category'),
      cateDao.queryCateById(pId),
      cateDao.queryMaxSortByCateIdAndSiteId(pId,site_id)
    ]).then(result => {
      res.render('manage/cms_category/create', {
        currentMenu: result[0],
        parentCate: result[1],
        maxSort: parseInt(result[2] ? result[2] : 0) + 10
      });
    });
  });

  /**
   * 编辑栏目分类
   */
  routeMethod.session('/manage/cms_category/edit','cms:cms_category:edit');
  app.all('/manage/cms_category/edit',async function (req, res) {
    let id = req.query.id;
    let cate = await cateDao.queryCateById(id);

    Promise.all([
      menuDao.queryMenuByHref('/manage/cms_category'),
      cateDao.queryCateById(cate.parent_id)
    ]).then(result => {
      res.render('manage/cms_category/create', {
        currentMenu: result[0],
        cate: cate,
        parentCate: result[1]
      });
    });
  });

  /**
   *  保存一个栏目分类信息
   */
  routeMethod.session('/manage/cms_category/store','cms:cms_category:edit');
  app.all('/manage/cms_category/store',async function (req, res) {
    let parent_id = req.body.parent_id;
    let name = req.body.name;
    let image = req.body.image;
    let href = req.body.href;
    let module = req.body.module;
    let target = req.body.target;
    let sort = req.body.sort;
    let description = req.body.description;
    let remarks = req.body.remarks;
    let site_id = req.session.site_id ? req.session.site_id : '1';
    let result = null;

    // 有ID就视为修改
    if (typeof (req.body.id) != 'undefined' && req.body.id != '') {
      result = await cateDao.updateCate(req);
      req.session.notice_info = {
        info:'修改栏目分类成功!',
        type:'success'
      };
    } else {
      result = await cateDao.saveCate(parent_id, site_id,module,name,image,href,target,description,sort,remarks, req);
      req.session.notice_info = {
        info:'保存栏目分类成功!',
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
   *  删除一个栏目分类信息
   */
  routeMethod.session('/manage/cms_category/delete','cms:cms_category:edit');
  app.all('/manage/cms_category/delete',async function (req, res) {
    let result = null;
    if (req.body.id) {
      let id = req.body.id;
      result = await cateDao.delCateById(id);

      if (result) {
        req.session.notice_info = {
          info:'删除栏目分类成功!',
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
      req.session.notice_info = {
        info:'删除失败,请传入一个有效的参数!',
        type:'fail'
      };
      res.json({
        result: true
      });
    }
  });

  routeMethod.session('/manage/cms_category','cms:cms_category:view');
  app.all('/manage/cms_category', function (req, res) {
    Promise.all([
      menuDao.queryMenuByHref('/manage/cms_category'),
      cateDao.queryCmsCateForRecursion('1')
    ]).then(result => {
      res.render('manage/cms_category/index', {
        currentMenu: result[0],
        cates: result[1]
      });
    });
  });
};