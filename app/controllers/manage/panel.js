'use strict';

/**
 * Module dependencies.
 */
const menuDao = require('../../dao/sys_menu');
const cmsSiteDao = require('../../dao/cms_site');
const userDao = require('../../dao/sys_user');


module.exports = function (app, routeMethod) {
  routeMethod.csurf('/manage/panel');
  routeMethod.session('/manage/panel','sys:panel:view');

  app.get('/manage/panel', function (req, res) {
    let user = req.session.user;

    Promise.all([
      menuDao.queryMenuByHref('/manage/panel'),
      cmsSiteDao.queryMyOfficeCurSite(user.office_id)
    ]).then(result => {

      res.render('manage/panel', {
        currentMenu: result[0],
        cmsSite: result[1]
      });
    });
  });
  
  routeMethod.csurf('/manage/update_user_avater');
  routeMethod.session('/manage/update_user_avater', 'sys:user:edit');
  app.post('/manage/update_user_avater',async function (req, res) {
    let result = await userDao.updateUserAvater(req);

    if (result){
      req.session.user.photo = req.body.photo;

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