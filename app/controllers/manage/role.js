'use strict';

/**
 * Module dependencies.
 */

const async = require('async');
const utils = require('../../utils');
const validator = require('validator');
const userDao = require('../../dao/user');
const dictDao = require('../../dao/dict');
const officeDao = require('../../dao/office');
const util = require('../../utils');
const menuDao = require('../../dao/menu');
const roleDao = require('../../dao/role');
const dictUtil = require('../../utils/dict_utils');
const moment = require('moment');


exports.PERMISSION = {
};


exports.ROUTER = {
  /**
   * 创建角色
   */
  '/manage/role/create': function (req, res) {

    async.auto({
      currentMenu: function (cb) {
        menuDao.queryMenuByHref('/manage/role', function (err, menu) {
          if (err || !menu) {
            cb(null, {});
          } else {
            cb(null, menu);
          }
        });
      },
      dataScope: function (cb) {
        dictUtil.getDictList('sys_data_scope', function (err, dataScope) {
          cb(null, dataScope);
        });
      },
      offices: function (cb) {
        officeDao.queryOffice(function (err, offices) {
          cb(null, offices);
        });
      },
      menus: function (cb) {
        menuDao.queryMenus(function (err, sysmenus) {
          cb(null, sysmenus);
        });
      }
    }, function (error, result) {

      res.render('manage/role/create', {
        currentMenu: result.currentMenu,
        dataScope: result.dataScope,
        offices: JSON.stringify(result.offices),
        menus: result.menus
      });
    });
  },
  /**
   * 编辑用户
   */
  '/manage/role/edit': function (req, res) {
    let id = req.query.id;

    async.auto({
      currentMenu: function (cb) {
        menuDao.queryMenuByHref('/manage/role', function (err, menu) {
          if (err || !menu) {
            cb(null, {});
          } else {
            cb(null, menu);
          }
        });
      },
      dataScope: function (cb) {
        dictUtil.getDictList('sys_data_scope', function (err, dataScope) {
          cb(null, dataScope);
        });
      },
      offices: function (cb) {
        officeDao.queryOffice(function (err, offices) {
          cb(null, offices);
        });
      },
      menus: function (cb) {
        menuDao.queryMenus(function (err, sysmenus) {
          cb(null, sysmenus);
        });
      },
      role: function (cb) {
        if (typeof (id) != 'undefined') {
          roleDao.queryRoleById(id, function (err, role) {
            cb(null, role);
          });
        } else {
          cb(null, null);
        }
      },
      roleMenus: function (cb) {
        if (typeof (id) != 'undefined') {
          roleDao.queryRoleMenusById(id, function (err, menus) {
            if (typeof (menus) != 'undefined') {
              let menuIds = '';
              for (let i = 0; i < menus.length; i++) {
                if (i == menus.length - 1) {
                  menuIds += menus[i].id;
                } else {
                  menuIds += menus[i].id + ',';
                }
              }
              console.log(menuIds);
              cb(null, menuIds);
            } else {
              cb(null, null);
            }
          });
        } else {
          cb(null, null);
        }
      }
    }, function (error, result) {
      res.render('manage/role/create', {
        currentMenu: result.currentMenu,
        dataScope: result.dataScope,
        offices: JSON.stringify(result.offices),
        menus: result.menus,
        role: result.role,
        roleMenus: result.roleMenus
      });
    });
  },
  /**
   *  显示角色详情
   */
  '/manage/role/show': function (req, res) {

  },
  /**
   *  保存一个角色信息
   */
  '/manage/role/store': function (req, res) {
    async.auto({
      store: function (cb) {
        let office_id = req.body.office_id;
        let name = req.body.name;
        let enname = req.body.enname;
        let data_scope = req.body.data_scope;
        let is_sys = req.body.is_sys;
        let useable = req.body.useable;
        let remarks = req.body.remarks;

        // 有ID就视为修改
        if (typeof (req.body.id) != 'undefined' && req.body.id != '') {
          roleDao.updateRole(req, function (err, result) {
            cb(null, result);
          });
        } else {
          roleDao.saveRole(office_id, name, enname, data_scope, is_sys, useable, remarks, req, function (err, result) {
            cb(null, result);
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
          error: '登录名重复请修改登录名'
        });
      }
    });
  },
  /**
   *  删除一个角色信息
   */
  '/manage/role/delete': function (req, res) {
    async.auto({
      delUser: function (cb) {

        if (req.body.id) {
          let id = req.body.id;
          roleDao.delRoleById(id, function (err, result) {
            cb(null, result);
          });
        } else {
          let ids = req.body.ids;
          let idsAry = ids.split('|');

          async.map(idsAry, function (id, idCallBack) {
            roleDao.delRoleById(id, function (err, result) {
              idCallBack(null, result);
            });
          }, function (err, result) {
            cb(null, result);
          });
        }
      }
    }, function (error, result) {
      if (result.delUser) {
        res.json({
          result: true
        });
      } else {
        res.json({
          result: false
        });
      }
    });
  },
  '/manage/role': function (req, res) {
    var currentPage = req.query.page ? req.query.page : 1; // 获取当前页数，如果没有则为1
    async.auto({
      roles: function (cb) {
        roleDao.queryAllRole(req, currentPage, 20, function (err, dicts) {
          if (err || !dicts) {
            cb(null, dicts);
          } else {
            cb(null, dicts);
          }
        });
      },
      // 查询用户数量
      rolesPage: ['roles', function (params, cb) {
        roleDao.queryAllRolePage(req, 20, currentPage, function (err, usersPage) {
          if (err || !usersPage) {
            cb(null, {});
          } else {
            cb(null, usersPage);
          }
        });
      }],
      currentMenu: function (cb) {
        menuDao.queryMenuByHref('/manage/role', function (err, menu) {
          if (err || !menu) {
            cb(null, {});
          } else {
            cb(null, menu);
          }
        });
      },
      dictTypes: function (cb) {
        dictDao.queryDictType(function (err, dictTypes) {
          cb(null, dictTypes);
        });
      },
      dataScope: function (cb) {
        dictUtil.getDictList('sys_data_scope', function (err, dataScope) {
          cb(null, dataScope);
        });
      },
    }, function (error, result) {
      let roles = result.roles;
      async.map(roles, function (role, roleCallback) {
        async.auto({
          dataScopeLabel: function (cb) {
            dictUtil.getDictLabel(role.data_scope, 'sys_data_scope', '未知', function (err, label) {
              cb(null, label);
            });
          }
        }, function (err, result) {
          role.data_scope_label = result.dataScopeLabel;
          role.create_date = moment(role.create_date).format('YYYY-MM-DD HH:mm:ss');
          role.is_sys_label = role.is_sys == 1 ? '是' : '否';

          roleCallback(null, role);
        });
      }, function (err, roles) {
        res.render('manage/role/index', {
          currentMenu: result.currentMenu,
          roles: roles,
          page: result.rolesPage,
          dictTypes: result.dictTypes,
          dataScope: result.dataScope
        });
      });
    });
  }
};