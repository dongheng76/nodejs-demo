'use strict';

/**
 * Module dependencies.
 */
const logDao = require('../../dao/sys_log');
const menuDao = require('../../dao/sys_menu');
const moment = require('moment');

module.exports = function (app, routeMethod) {

  app.all('/manage/log', function (req, res) {
    var currentPage = req.query.page ? req.query.page : 1; // 获取当前页数，如果没有则为1
      Promise.all([
            menuDao.queryMenuByHref('/manage/log'),
            logDao.queryAllLogs(req,currentPage, 20),
            logDao.queryAllLogPage(req,20,currentPage)
        ]).then(async result => {
            let logs=result[1];
            let prologs = logs.map(async log => {
               log.create_date = moment(log.create_date).format('YYYY-MM-DD HH:mm:ss');
               return log;
             });
            Promise.all(prologs).then(results => {
              res.render('manage/sys_log/index', {
                  currentMenu: result[0],
                  logs: logs,
                  page: result[2]
                });
            });
         });
  });
};