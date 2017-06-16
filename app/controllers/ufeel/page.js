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
  app.all('/ufeel', function (req, res) {
    let siteId = 'c46f915050dd11e79e03715d6c7b2c7d';

    Promise.all([
      cateDao.queryCmsCateForRecursion(siteId),
      // 我们做什么的图片
      articleDao.queryArticleInfoByCateId('c8172dd050e311e7875527e3b303b0fb'),
      // 团队成员的图片
      articleDao.queryArticleInfoByCateId('94d9e41050e511e7875527e3b303b0fb')
    ]).then(result => {
      res.render('ufeel/index', {
        cates: result[0],
        ourTodoImg: result[1],
        teamMem: result[2]
      });
    });
  });
};