'use strict';

/**
 * Module dependencies.
 */
const utils = require('../../utils');
const cateDao = require('../../dao/cms_category.js');
const articleDao = require('../../dao/cms_article.js');


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
      res.render('dnbyz/index', {
        cates: result[0],
        curCate: result[1],
        dundongguanggao: result[2],
        shuoming: result[3],
        anli: result[4],
        xinwen: result[5],
        qaf: result[6],
        jinpaiwenxiu: result[7]
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
      cateDao.queryCmsCateForRecursionByModuleAndSiteId(siteId,'project')
    ]).then(result => {
      res.render('dnbyz/project', {
        cates: result[0],
        curCate: result[1]
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
      cateDao.queryCmsCateForRecursionByModuleAndSiteId(siteId,'share')
    ]).then(result => {
      res.render('dnbyz/share', {
        cates: result[0],
        curCate: result[1]
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
      cateDao.queryCmsCateForRecursionByModuleAndSiteId(siteId,'about')
    ]).then(result => {
      res.render('dnbyz/about', {
        cates: result[0],
        curCate: result[1]
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
      cateDao.queryCmsCateForRecursionByModuleAndSiteId(siteId,'contact')
    ]).then(result => {
      res.render('dnbyz/contact', {
        cates: result[0],
        curCate: result[1]
      });
    });
  });
};