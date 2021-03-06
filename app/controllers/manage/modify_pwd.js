'use strict';

/**
 * Module dependencies.
 */
const utils = require('../../utils');
const menuDao = require('../../dao/sys_menu');
const userDao = require('../../dao/sys_user');

module.exports = function (app, routeMethod) {
  routeMethod.csurf('/manage/user/modify_pwd');
  routeMethod.session('/manage/user/modify_pwd','sys:menu:view');
  app.get('/manage/user/modify_pwd', function (req, res) {
    Promise.all([menuDao.queryMenuByHref('/manage/panel')]).then(result => {
      res.render('manage/modify_pwd/create', {
        currentMenu: result[0]
      });
    });
  });
  
  /**
   *  修改密码
   */
  routeMethod.csurf('/manage/modify_pwd');
  routeMethod.session('/manage/modify_pwd','sys:menu:edit');
  app.post('/manage/modify_pwd',async function (req, res) { 
    let password = req.body.oldpassword;
    let newpassword = req.body.password;
    let loginName = req.session.user.login_name;
    let result = null;
    // 验证原始密码是否正确
    let user = await userDao.queryUserByUserNameAndPwd(loginName, utils.md5(password),req);
     if (typeof (user) == 'undefined') {
       res.json({
        result: false,
        error: '原始密码错误，修改失败'
      });
    } else {
        result = userDao.updateUserPwd(loginName,newpassword, req);
        req.session.notice_info = {
          info: '修改用户成功!',
          type: 'success'
        };
    }

    if (result) {
        res.json({
          result: true
        });
      } else {
        req.session.notice_info = null;
        res.json({
          result: false,
          error: '网络出现问题请重试!'
        });
      }
  });
};




