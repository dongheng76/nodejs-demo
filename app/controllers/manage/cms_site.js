'use strict';

/**
 * Module dependencies.
 */
const validator = require('validator');
const siteDao = require('../../dao/cms_site');
const util = require('../../utils');
const menuDao = require('../../dao/sys_menu');
const dictUtil = require('../../utils/dict_utils');
const moment = require('moment');


module.exports = function (app, routeMethod) {
  /**
   * 切换当前站点信息
   */
  routeMethod.csurf('/manage/site/changesite');
  routeMethod.session('/manage/site/changesite','cms:site:edit');
  app.all('/manage/site/changesite',async function (req, res) {
    let site_id = req.body.site_id;
    let office_id = req.session.user.office_id;

    let result = siteDao.changeCurrentSite(site_id,office_id);
    if (result){
      req.session.notice_info = {
        info:'切换站点成功!',
        type:'success'
      };
      res.json({
        result: true
      });
    } else {
      res.json({
        result: false,
        error: '操作失败请重试!'
      });
    }
  });

  /**
   * 创建站点
   */
  routeMethod.csurf('/manage/site/create');
  routeMethod.session('/manage/site/create','cms:site:edit');
  app.all('/manage/site/create', function (req, res) {

    Promise.all([
      menuDao.queryMenuByHref('/manage/site')
    ]).then(result => {
      res.render('manage/cms_site/create', {
        currentMenu: result[0]
      });
    });
  });

  /**
   * 编辑站点
   */
  routeMethod.csurf('/manage/site/edit');
  routeMethod.session('/manage/site/edit','cms:site:edit');
  app.all('/manage/site/edit', function (req, res) {
    let id = req.query.id;

    Promise.all([
      menuDao.queryMenuByHref('/manage/site'),
      siteDao.querySiteById(id),
    ]).then(result => {
      res.render('manage/cms_site/create', {
        currentMenu: result[0],
        site: result[1]
      });
    });
  });

  /**
   *  保存一个站点信息
   */
  routeMethod.csurf('/manage/site/store');
  routeMethod.session('/manage/site/store','cms:site:edit');
  app.all('/manage/site/store',async function (req, res) {
    let name = req.body.name;
    let title = req.body.title;
    let logo = req.body.logo;
    let domain = req.body.domain;
    let domain_name = req.body.domain_name;
    let keywords = req.body.keywords;
    let description = req.body.description;
    let copyright = req.body.copyright;
    let remarks = req.body.remarks;
    let result = null;

    // 有ID就视为修改
    if (typeof (req.body.id) != 'undefined' && req.body.id != '') {
      result = await siteDao.updateSite(req);
      req.session.notice_info = {
        info:'修改站点成功!',
        type:'success'
      };
    } else {
      result = await siteDao.saveSite(name, title, logo,domain,description,keywords,copyright, remarks,domain_name,req);
      req.session.notice_info = {
        info:'保存站点成功!',
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
   *  删除一个站点信息
   */
  routeMethod.csurf('/manage/site/delete');
  routeMethod.session('/manage/site/delete','cms:site:edit');
  app.all('/manage/site/delete',async function (req, res) {
    let result = null;
    if (req.body.id) {
      let id = req.body.id;
      result = await siteDao.delSiteById(id);

      if (result) {
        req.session.notice_info = {
          info:'删除站点成功!',
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
        return siteDao.delSiteById(id);
      });
      Promise.all(proIdsAry).then(results => {
        req.session.notice_info = {
          info:'删除站点成功!',
          type:'success'
        };

        res.json({
          result: true
        });
      });
    }
  });

  routeMethod.csurf('/manage/site');
  routeMethod.session('/manage/site','cms:site:view');
  app.all('/manage/site', function (req, res) {
    let currentPage = req.query.page ? req.query.page : 1; // 获取当前页数，如果没有则为1
    Promise.all([
      menuDao.queryMenuByHref('/manage/site'),
      siteDao.queryAllSite(req, currentPage, 20),
      siteDao.queryAllSitePage(req, 20, currentPage),
      siteDao.queryMyOfficeCurSite(req.session.user.office_id)
    ]).then(result => {
      res.render('manage/cms_site/index', {
        currentMenu: result[0],
        sites: result[1],
        page: result[2],
        currentSiteId: result[3] ? result[3].site_id : '1'
      });
    });
  });
};