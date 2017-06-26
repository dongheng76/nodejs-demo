'use strict';

/**
 * Module dependencies.
 */
const utils = require('../../utils');
const cateDao = require('../../dao/cms_category.js');
const articleDao = require('../../dao/cms_article.js');
const guestbookDao = require('../../dao/cms_guestbook.js');

module.exports = function (app, routeMethod) {
  /**
   * 网页首页
   */
  app.all('/dnbyz', function (req, res) {
    let siteId = '319c0130477611e78e8069f129225150';

    Promise.all([
      cateDao.queryCmsCateForRecursion(siteId),
      cateDao.queryCmsCateForRecursionByModuleAndSiteId(siteId,'index'),
      articleDao.queryArticleInfoByCateId('f72e27704bf411e780309d6de1be898e'),
      articleDao.queryArticleInfoByCateId('0a6485004bf511e780309d6de1be898e'),
      articleDao.queryArticleInfoByCateId('22fbfda04bf511e780309d6de1be898e'),
      articleDao.queryArticleInfoByCateId('52bb32404bf511e780309d6de1be898e'),
      articleDao.queryArticleInfoByCateId('720377704bf511e780309d6de1be898e'),
      articleDao.queryArticleInfoByCateId('922888104bf511e780309d6de1be898e')      
    ]).then(result => {
      let anli = result[4];
      anli.forEach(function (al){
        if (al.image)
          al.image_json = JSON.parse(al.image);
      });

      let jinpaiwenxiu = result[7];
      jinpaiwenxiu.forEach(function (wxs){
        if (wxs.image)
          wxs.image_json = JSON.parse(wxs.image);
      });

      let dundongguanggao = result[2];
      dundongguanggao.forEach(function (adv){
        if (adv.image)
          adv.image_json = JSON.parse(adv.image);
      });
      

      res.render('dnbyz/index', {
        cates: result[0],
        curCate: result[1],
        dundongguanggao: dundongguanggao,
        shuoming: result[3],
        anli: anli,
        xinwen: result[5],
        qaf: result[6],
        jinpaiwenxiu: jinpaiwenxiu,
        moment: require('moment')
      });
    });
  });

  /**
   * 服务项目
   */
  app.all('/dnbyz/project', function (req, res) {
    let siteId = '319c0130477611e78e8069f129225150';

    Promise.all([
      cateDao.queryCmsCateForRecursion(siteId),      
      cateDao.queryCmsCateForRecursionByModuleAndSiteId(siteId,'project'),
      articleDao.queryArticleInfoByCateId('922888104bf511e780309d6de1be898e'),
      articleDao.queryArticleInfoByCateId('72273e004bf311e780309d6de1be898e')
      
    ]).then(result => {
      let jinpaiwenxiu = result[2];
      jinpaiwenxiu.forEach(function (wxs){
        if (wxs.image)
          wxs.image_json = JSON.parse(wxs.image);
      });

      let projects = result[3];
      projects.forEach(function (project){
        if (project.image)
          project.image_json = JSON.parse(project.image);
      });

      res.render('dnbyz/project', {
        cates: result[0],
        curCate: result[1],
        jinpaiwenxiu: result[2],
        projects: projects
      });
    });
  });

  /**
   * 案例分享
   */
  app.all('/dnbyz/share', function (req, res) {
    let siteId = '319c0130477611e78e8069f129225150';

    Promise.all([
      cateDao.queryCmsCateForRecursion(siteId),
      cateDao.queryCmsCateForRecursionByModuleAndSiteId(siteId,'share'),
      articleDao.queryArticleInfoByCateId('922888104bf511e780309d6de1be898e'),
      articleDao.queryArticleInfoByCateId('da849e704bf311e780309d6de1be898e')
    ]).then(result => {
      let jinpaiwenxiu = result[2];
      jinpaiwenxiu.forEach(function (wxs){
        if (wxs.image)
          wxs.image_json = JSON.parse(wxs.image);
      });

      let anlis = result[3];
      anlis.forEach(function (anli){
        if (anli.image)
          anli.image_json = JSON.parse(anli.image);
      });

      res.render('dnbyz/share', {
        cates: result[0],
        curCate: result[1],
        jinpaiwenxiu: jinpaiwenxiu,
        anlis: anlis
      });
    });
  });

  /**
   * 关于我们
   */
  app.all('/dnbyz/about', function (req, res) {
    let siteId = '319c0130477611e78e8069f129225150';

    Promise.all([
      cateDao.queryCmsCateForRecursion(siteId),
      cateDao.queryCmsCateForRecursionByModuleAndSiteId(siteId,'about'),
      articleDao.queryArticleInfoByCateId('922888104bf511e780309d6de1be898e'),
      articleDao.queryArticleInfoByCateId('0ffde3904bf411e780309d6de1be898e'),
      articleDao.queryArticleInfoByCateId('52bb32404bf511e780309d6de1be898e'),
      articleDao.queryArticleInfoByCateId('720377704bf511e780309d6de1be898e')
    ]).then(result => {
      let jinpaiwenxiu = result[2];
      jinpaiwenxiu.forEach(function (wxs){
        if (wxs.image)
          wxs.image_json = JSON.parse(wxs.image);
      });

      res.render('dnbyz/about', {
        cates: result[0],
        curCate: result[1],
        jinpaiwenxiu: jinpaiwenxiu,
        abouts: result[3],
        xinwen: result[4],
        qaf: result[5],        
        moment: require('moment')
      });
    });
  });

  /**
   * 联系我们
   */
  app.all('/dnbyz/contact', function (req, res) {
    let siteId = '319c0130477611e78e8069f129225150';

    Promise.all([
      cateDao.queryCmsCateForRecursion(siteId),      
      cateDao.queryCmsCateForRecursionByModuleAndSiteId(siteId,'contact'),
      articleDao.queryArticleInfoByCateId('922888104bf511e780309d6de1be898e'),
      articleDao.queryArticleInfoByCateId('c30c4a104bf611e7987a797906eb157d'),
      articleDao.queryArticleInfoByCateId('e30ff0004bf611e7987a797906eb157d')
      
    ]).then(result => {
      let jinpaiwenxiu = result[2];
      jinpaiwenxiu.forEach(function (wxs){
        if (wxs.image)
          wxs.image_json = JSON.parse(wxs.image);
      });

      res.render('dnbyz/contact', {
        cates: result[0],
        curCate: result[1],
        jinpaiwenxiu: jinpaiwenxiu,
        maps: result[3],
        contacts: result[4]
      });
    });
  });

  /**
   * 新闻列表详细页
   */
  app.all('/dnbyz/list', function (req, res) {
    let siteId = '319c0130477611e78e8069f129225150';

    Promise.all([
      cateDao.queryCmsCateForRecursion(siteId),      
      cateDao.queryCmsCateForRecursionByModuleAndSiteId(siteId,'contact'),
      articleDao.queryArticleInfoByCateId('922888104bf511e780309d6de1be898e'),
      articleDao.queryArticleInfoByCateId('52bb32404bf511e780309d6de1be898e')
      
    ]).then(result => {
      res.render('dnbyz/list', {
        cates: result[0],
        curCate: result[1],
        jinpaiwenxiu: result[2],
        news: result[3]
      });
    });
  });

  /**
   * 根据板块进行留言
   */
  app.all('/dnbyz/msgboard',async function (req, res) {
    let result = guestbookDao.saveGuestbook(req);
    if (result){
      res.json({
        result:true
      });
    } else {
      res.json({
        result:false
      });
    }
  });
};