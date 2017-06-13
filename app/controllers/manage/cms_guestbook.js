'use strict';

/**
 * Module dependencies.
 */
const utils = require('../../utils');
const validator = require('validator');
const dictDao = require('../../dao/sys_dict');
const siteDao = require('../../dao/cms_site');
const guestbookDao = require('../../dao/cms_guestbook');
const cateDao = require('../../dao/cms_category');
const util = require('../../utils');
const menuDao = require('../../dao/sys_menu');
const dictUtil = require('../../utils/dict_utils');
const moment = require('moment');


module.exports = function (app, routeMethod) {
  
  routeMethod.csurf('/manage/cms_guestbook');
  //routeMethod.session('/manage/cms_guestbook','cms:cms_guestbook:view');
  app.all('/manage/cms_guestbook',async function (req, res) {
    let site = await siteDao.queryMyOfficeCurSite(req.session.user.office_id);
    let site_id = site ? site.site_id : '1';
    let currentPage = req.query.page ? req.query.page : 1; // 获取当前页数，如果没有则为1
    let cates = await cateDao.queryCateBySiteId(site_id);
    let cateId = null;
    if (typeof(req.query.cate_id) != 'undefined'){
      cateId = req.query.cate_id;
    } else {
      console.log(cates.length);
      // 当前的cateId为第一个parent_id等于0的
      for (var i = 0;i < cates.length;i++){
        if (cates[i].parent_id == '0'){
          cateId = cates[i].id;
          break;
        }
      }
    }

    Promise.all([
      menuDao.queryMenuByHref('/manage/cms_guestbook'),
      guestbookDao.queryAllGuestbook(cateId,req,currentPage,20),
      guestbookDao.queryAllGuestbookPage(cateId,req,20,currentPage)
    ]).then(result => {
      result[1].map(guestbook => {
        guestbook.create_date = moment(guestbook.create_date).format('YYYY-MM-DD HH:mm:ss');
      });      

      res.render('manage/cms_guestbook/index', {
        currentMenu: result[0],
        cates: JSON.stringify(cates),
        guestbooks: result[1],
        page: result[2],
        cateId: cateId
      });
    });
  });
};