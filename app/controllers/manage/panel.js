'use strict';

/**
 * Module dependencies.
 */
const validator = require('validator');
const menuDao = require('../../dao/sys_menu');


module.exports = function (app, routeMethod) {
  app.all('/manage/panel', function (req, res) {
    Promise.all([menuDao.queryMenuByHref('/manage/panel')]).then(result => {
      res.render('manage/panel', {
        currentMenu: result[0]
      });
    });
  });
};