'use strict';

/**
 * Module dependencies.
 */
const commentDao = require('../../dao/cms_comment');
const menuDao = require('../../dao/sys_menu');
const moment = require('moment');

module.exports = function (app, routeMethod) {

  routeMethod.csurf('/cms/comment');
  app.get('/cms/comment', function (req, res) {
    var currentPage = req.query.page ? req.query.page : 1; // 获取当前页数，如果没有则为1

    Promise.all([
      commentDao.queryAllComment(req, currentPage, 20),
      // 查询用户数量
      commentDao.queryAllCommentPage(req, 20, currentPage),
      menuDao.queryMenuByHref('/cms/comment')
    ]).then(async result => {
      let coms = result[0];
      let procoms = coms.map(async com => {
        com.create_date = moment(com.create_date).format('YYYY-MM-DD HH:mm:ss');
        return com;
      });

      Promise.all(procoms).then(results => {
        res.render('manage/cms_comment/index', {
          currentMenu: result[2],
          coms: coms,
          page: result[1],
          condition: req.query
        });
      });
    });
  });
};