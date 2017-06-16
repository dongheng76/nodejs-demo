'use strict';

/**
 * Module dependencies.
 */
const menuDao = require('../../dao/sys_menu');


module.exports = function (app, routeMethod) {
  routeMethod.csurf('/manage/panel');
  routeMethod.session('/manage/panel','sys:panel:view');
  app.get('/manage/panel', function (req, res) {
    Promise.all([menuDao.queryMenuByHref('/manage/panel')]).then(result => {
      res.render('manage/panel', {
        currentMenu: result[0]
      });
    });
  });
};