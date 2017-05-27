'use strict';

/**
 * Module dependencies.
 */
const async = require('async');
const md5 = require('md5');
const validator = require('validator');
const menuDao = require('../../dao/menu');


module.exports = function (app, permission) {
  app.all('/manage/panel', function (req, res) {
    menuDao.queryMenuByHref('/manage/panel', function (err, menu) {
      if (err || !menu) {
        return;
      } else {
        res.render('manage/panel', {
          currentMenu: menu
        });
      }
    });
  });
};