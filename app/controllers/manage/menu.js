'use strict';

/**
 * Module dependencies.
 */

const async = require('async');
const utils = require('../../utils');
const validator = require('validator');
const userDao = require('../../dao/user');
const officeDao = require('../../dao/office');
const util = require('../../utils');
const menuDao = require('../../dao/menu');
const dictUtil = require('../../utils/dict_utils');
const moment = require('moment');

module.exports = function (app, routeMethod) {
  /**
   * 创建菜单
   */
  app.all('/manage/menu/create', function (req, res) {
    let pId = req.query.parent_id ? req.query.parent_id : '1';

    async.auto({
      currentMenu: function (cb) {
        menuDao.queryMenuByHref('/manage/menu', function (err, menu) {
          if (err || !menu) {
            cb(null, false);
          } else {
            cb(null, menu);
          }
        });
      },
      menus: function (cb) {
        menuDao.queryMenus(function (err, menus) {
          if (err || !menus) {
            cb(null, false);
          } else {
            cb(null, menus);
          }
        });
      },
      maxSort: function (cb) {
        menuDao.querySortMaxByPId(pId, function (err, maxSort) {
          if (maxSort != null) {
            cb(null, maxSort);
          } else {
            cb(null, 0);
          }
        });
      },
      menuParent: function (cb) {
        menuDao.queryMenuById(pId, function (err, menuParent) {
          if (err || !menuParent) {
            cb(null, false);
          } else {
            cb(null, menuParent);
          }
        });
      }
    }, function (error, result) {

      res.render('manage/menu/create', {
        currentMenu: result.currentMenu,
        selectMenus: JSON.stringify(result.menus),
        maxSort: parseInt(result.maxSort) + 10,
        menuParent: result.menuParent
      });
    });
  });

  /**
   * 编辑用户
   */
  app.all('/manage/menu/edit', function (req, res) {
    let id = req.query.id;

    async.auto({
      currentMenu: function (cb) {
        menuDao.queryMenuByHref('/manage/menu', function (err, menu) {
          if (err || !menu) {
            cb(null, {});
          } else {
            cb(null, menu);
          }
        });
      },
      menus: function (cb) {
        menuDao.queryMenus(function (err, menus) {
          if (err || !menus) {
            cb(null, false);
          } else {
            cb(null, menus);
          }
        });
      },
      menuParent: function (cb) {
        menuDao.queryMenuById(id, function (err, menu) {
          menuDao.queryMenuById(menu.parent_id, function (err, menuParent) {
            if (err || !menuParent) {
              cb(null, false);
            } else {
              cb(null, menuParent);
            }
          });
        });
      },
      menu: function (cb) {
        menuDao.queryMenuById(id, function (err, menu) {
          if (err || !menu) {
            cb(null, false);
          } else {
            cb(null, menu);
          }
        });
      }
    }, function (error, result) {
      res.render('manage/menu/create', {
        currentMenu: result.currentMenu,
        menuParent: result.menuParent,
        offices: JSON.stringify(result.offices),
        menu: result.menu
      });
    });
  });

  /**
   *  显示用户详情
   */
  app.all('/manage/menu/show', function (req, res) {

  });

  /**
   *  保存一个菜单信息
   */
  app.all('/manage/menu/store', function (req, res) {
    async.auto({
      store: function (cb) {
        let parent_id = req.body.parent_id;
        let name = req.body.name;
        let sort = req.body.sort;
        let href = req.body.href;
        let icon = req.body.icon;
        let permission = req.body.permission;
        let remarks = req.body.remarks;

        // 有ID就视为修改
        if (typeof (req.body.id) != 'undefined' && req.body.id != '') {
          menuDao.updateMenu(req, function (err, result) {
            if (err || !result) {
              req.session.notice_info = {
                info:'修改失败!请重试或检查下您传入的参数是否正确!',
                type:'fail'
              };
              cb(null, false);
            } else {
              req.session.notice_info = {
                info:'修改菜单成功!',
                type:'success'
              };
              cb(err, result);
            }
          });
        } else {
          menuDao.saveMenu(parent_id, name, sort, href, icon, permission, remarks, req, function (err, result) {
            if (err || !result) {
              req.session.notice_info = {
                info:'保存失败!请重试或检查下您传入的参数是否正确!',
                type:'fail'
              };
              cb(null, false);
            } else {
              req.session.notice_info = {
                info:'保存菜单成功!',
                type:'success'
              };
              cb(null, result);
            }
          });
        }
      }
    }, function (error, result) {
      if (result.store) {
        res.json({
          result: true
        });
      } else {
        res.json({
          result: false,
          error: '网络异常请重试！'
        });
      }
    });
  });

  /**
   *  删除一个菜单信息
   */
  app.all('/manage/menu/delete', function (req, res) {
    async.auto({
      delMenu: function (cb) {

        if (typeof (req.body.id) != 'undefined') {
          let id = req.body.id;
          menuDao.delMenuById(id, function (err, result) {
            if (err || !result){
              cb(null, false);
            } else {
              cb(null, result);
            }
          });
        } else {
          cb(null, false);
        }
      }
    }, function (error, result) {
      if (typeof (result.delMenu) != 'undefined') {
        req.session.notice_info = {
          info:'删除菜单成功!',
          type:'success'
        };
        
        res.json({
          result: true
        });
      } else {
        res.json({
          result: false
        });
      }
    });
  });

  app.all('/manage/menu', function (req, res) {

    async.auto({
      currentMenu: function (cb) {
        menuDao.queryMenuByHref('/manage/menu', function (err, menu) {
          if (err || !menu) {
            cb(null, {});
          } else {
            cb(null, menu);
          }
        });
      },
      menus: function (cb) {
        menuDao.queryMenuForRecursion(function (err, menus) {
          cb(null, menus);
        });
      }
    }, function (error, result) {

      res.render('manage/menu/index', {
        currentMenu: result.currentMenu,
        menus: result.menus
      });
    });
  });
};