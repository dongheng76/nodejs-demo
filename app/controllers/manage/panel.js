'use strict';

/**
 * Module dependencies.
 */
const async = require('async');
const md5 = require('md5');
const validator = require('validator');
const menuDao = require('../../dao/menu');


module.exports = function (app, routeMethod) {
  app.all('/manage/panel', function (req, res) {
    Promise.all([menuDao.queryMenuByHref('/manage/panel')]).then(result => {
      res.render('manage/panel', {
        currentMenu: result[0]
      });
    });
  });
};