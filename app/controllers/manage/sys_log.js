'use strict';

/**
 * Module dependencies.
 */
const async = require('async');
const logDao = require('../../dao/sys_log');
const menuDao = require('../../dao/sys_menu');
const utils = require('../../utils');
const validator = require('validator');
const util = require('../../utils');
const dictUtil = require('../../utils/dict_utils');
const moment = require('moment');

module.exports = function (app, routeMethod) {

  app.all('/manage/log', function (req, res) {
    var currentPage = req.query.page ? req.query.page : 1; // 获取当前页数，如果没有则为1
    async.auto({
      logs: function (cb) {
        logDao.queryAllLogs(req, currentPage, 20, function (err, logs) {
          if (err || !logs) {
            cb(null, logs);
          } else {
            logs.forEach(function (log) {
              log.create_date = moment(log.create_date).format("YYYY-MM-DD HH:mm:ss");
            });
            cb(null, logs);
          }
        });
      },
      logsPage: ['logs', function (params, cb) {
        logDao.queryAllLogPage(req, 20, currentPage, function (err, usersPage) {
          if (err || !usersPage) {
            cb(null, false);
          } else {
            cb(null, usersPage);
          }
        });
      }],
      currentMenu: function (cb) {
        menuDao.queryMenuByHref('/manage/dict', function (err, menu) {
          if (err || !menu) {
            cb(null, false);
          } else {
            cb(null, menu);
          }
        });
      },
    }, function (error, result) {
      res.render('manage/sys_log/index', {
        currentMenu: result.currentMenu,
        logs: result.logs,
        page: result.logsPage
      });
    });
  });
};