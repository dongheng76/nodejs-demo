'use strict';

/**
 * Module dependencies.
 */
const siteDao = require('../../dao/cms_site');
const articleDao = require('../../dao/cms_article');
const cateDao = require('../../dao/cms_category');
const util = require('../../utils');
const menuDao = require('../../dao/sys_menu');
const moment = require('moment');
const guestbookDao = require('../../dao/cms_guestbook');


module.exports = function (app, routeMethod) {
  /**
   * 创建文章信息
   */
  routeMethod.csurf('/manage/cms_article/create');
  routeMethod.session('/manage/cms_article/create','cms:cms_article:edit');
  app.all('/manage/cms_article/create', function (req, res) {
    let cate_id = req.query.cate_id;

    Promise.all([
      menuDao.queryMenuByHref('/manage/cms_article'),
      cateDao.queryCateById(cate_id)
    ]).then(result => {
      let cate = result[1];
      if (cate.field_json){
        cate.fields = JSON.parse(cate.field_json);
      }

      res.render('manage/cms_article/create', {
        currentMenu: result[0],
        cate_id: cate_id,
        cate: cate
      });
    });
  });

  /**
   * 编辑栏目分类
   */
  routeMethod.csurf('/manage/cms_article/edit');
  routeMethod.session('/manage/cms_article/edit','cms:cms_article:edit');
  app.all('/manage/cms_article/edit',async function (req, res) {
    let id = req.query.id;

    Promise.all([
      menuDao.queryMenuByHref('/manage/cms_article'),
      articleDao.queryArtcleById(id)
    ]).then(async result => {
      let cate = await cateDao.queryCateById(result[1].category_id);
      if (cate.field_json){
        cate.fields = JSON.parse(cate.field_json);
      }

      res.render('manage/cms_article/create', {
        currentMenu: result[0],
        article: result[1],
        cate_id: result[1].category_id,
        cate: cate
      });
    });
  });

  /**
   *  保存一个网站记录信息
   */
  routeMethod.csurf('/manage/cms_article/store');
  routeMethod.session('/manage/cms_article/store','cms:cms_article:edit');
  app.all('/manage/cms_article/store',async function (req, res) {
    let category_id = req.body.category_id ? req.body.category_id : '';
    let title = req.body.title ? req.body.title : '';
    let link = req.body.my_link ? req.body.my_link : '';
    let color = req.body.color ? req.body.color : '';
    let image = req.body.image ? req.body.image : '';
    let description = req.body.description ? req.body.description : '';
    let remarks = req.body.remarks ? req.body.remarks : '';
    let content = req.body.content ? req.body.content : '';
    let phone_content = req.body.phone_content ? req.body.phone_content : '';
    let sort = req.body.sort ? req.body.sort : null;
    // 保存经度
    let longitude = req.body.mapLongitude ? req.body.mapLongitude : 0;
    // 保存纬度
    let latitude = req.body.mapLatitude ? req.body.mapLatitude : 0;
    let result = null;

    // 有ID就视为修改
    if (typeof (req.body.id) != 'undefined' && req.body.id != '') {
      result = await articleDao.updateArticle(req);
      req.session.notice_info = {
        info:'修改栏目文章成功!',
        type:'success'
      };
    } else {
      result = await articleDao.saveArticle(category_id,title,link,color,image,description, remarks,content,phone_content,longitude,latitude,sort,req);
      req.session.notice_info = {
        info:'保存栏目文章成功!',
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
   *  删除一个文章类信息
   */
  routeMethod.csurf('/manage/cms_article/delete');
  routeMethod.session('/manage/cms_article/delete','cms:cms_article:edit');
  app.all('/manage/cms_article/delete',async function (req, res) {
    let result = null;
    if (req.body.id) {
      let id = req.body.id;
      result = await articleDao.delArticleById(id);

      if (result) {
        req.session.notice_info = {
          info:'删除文章成功!',
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
        return articleDao.delArticleById(id);
      });
      Promise.all(proIdsAry).then(results => {
        req.session.notice_info = {
          info:'删除文章成功!',
          type:'success'
        };

        res.json({
          result: true
        });
      });
    }
  });

  routeMethod.csurf('/manage/cms_article');
  routeMethod.session('/manage/cms_article','cms:cms_article:view');
  app.all('/manage/cms_article',async function (req, res) {
    let site = await siteDao.queryMyOfficeCurSite(req.session.user.office_id);
    let site_id = site ? site.site_id : '1';
    let currentPage = req.query.page ? req.query.page : 1; // 获取当前页数，如果没有则为1
    let cates = await cateDao.queryCateBySiteId(site_id);
    let cateId = null;
    if (typeof(req.query.cate_id) != 'undefined'){
      cateId = req.query.cate_id;
    } else {
      // 当前的cateId为第一个parent_id等于0的
      for (var i = 0;i < cates.length;i++){
        if (cates[i].parent_id == '0'){
          cateId = cates[i].id;
          break;
        }
      }
    }
    let cate = await cateDao.queryCateById(cateId);

    // 首先查询出栏目信息
    // 通过栏目信息判断是否是留言信息
    // 留言信息需要另外指向模板
    if (cate && cate.is_msg == '1'){
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
    } else {
      Promise.all([
        menuDao.queryMenuByHref('/manage/cms_article'),
        articleDao.queryAllArticle(cateId,req,currentPage,20),
        articleDao.queryAllArticlePage(cateId,req,20,currentPage),
      ]).then(result => {
        result[1].map(article => {
          article.create_date = moment(article.create_date).format('YYYY-MM-DD HH:mm:ss');
        });      

        if (cate.field_json){
          cate.fields = JSON.parse(cate.field_json);
        }

        let articles = result[1];
        articles.forEach(article => {
          if (article.image){
            article.image_json = JSON.parse(article.image);
          }
        });

        res.render('manage/cms_article/index', {
          currentMenu: result[0],
          cates: JSON.stringify(cates),
          articles: result[1],
          page: result[2],
          cateId: cateId,
          cate: cate
        });
      });
    }
  });
};