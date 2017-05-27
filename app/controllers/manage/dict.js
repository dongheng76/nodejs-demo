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
const dictUtil = require('../../utils/dict_utils');
const moment = require('moment');


module.exports = function (app, routeMethod) {
  /**
   * 创建字典
   */
  routeMethod.session('/manage/dict/create','sys:dict:edit');
  app.all('/manage/dict/create', function (req, res) {
    let type = req.query.type;

    async.auto({
      currentMenu: function (cb) {
        menuDao.queryMenuByHref('/manage/user', function (err, menu) {
          if (err || !menu) {
            cb(null, false);
          } else {
            cb(null, menu);
          }
        });
      },
      dataScopes: function (cb) {
        dictUtil.getDictList('sys_data_scope', function (err, dataScopes) {
          if (err || !dataScopes) {
            cb(null, false);
          } else {
            cb(null, dataScopes);
          }
        });
      },
      roles: function (cb) {
        userDao.queryRolesForAuth(req, function (err, roles) {
          if (err || !roles) {
            cb(null, false);
          } else {
            cb(null, roles);
          }
        });
      },
      offices: function (cb) {
        officeDao.queryOffice(function (err, offices) {
          if (err || !offices) {
            cb(null, false);
          } else {
            cb(null, offices);
          }
        });
      },
      maxSort: function (cb) {
        if (typeof (type) != 'undefined') {
          dictDao.queryMaxSortByType(type, function (err, maxSort) {
            if (err || !maxSort) {
              cb(null, false);
            } else {
              cb(null, maxSort);
            }
          });
        } else {
          cb(null, 0);
        }
      }
    }, function (error, result) {

      res.render('manage/dict/create', {
        currentMenu: result.currentMenu,
        maxSort: result.maxSort + 10,
        type: type
      });
    });
  });

  /**
   * 编辑字典
   */
  routeMethod.session('/manage/dict/edit','sys:dict:edit');
  app.all('/manage/dict/edit', function (req, res) {
    let id = req.query.id;

    async.auto({
      currentMenu: function (cb) {
        menuDao.queryMenuByHref('/manage/dict', function (err, menu) {
          if (err || !menu) {
            cb(null, false);
          } else {
            cb(null, menu);
          }
        });
      },
      dict: function (cb) {
        dictDao.queryDictById(id, function (err, dict) {
          if (err || !dict) {
            cb(null, false);
          } else {
            cb(null, dict);
          }
        });
      }
    }, function (error, result) {
      res.render('manage/dict/create', {
        currentMenu: result.currentMenu,
        dict: result.dict
      });
    });
  });

  /**
   *  保存一个用户信息
   */
  routeMethod.session('/manage/dict/store','sys:dict:edit');
  app.all('/manage/dict/store', function (req, res) {
    async.auto({
      store: function (cb) {
        let value = req.body.value;
        let label = req.body.label;
        let type = req.body.type;
        let sort = req.body.sort;
        let description = req.body.description;
        let remarks = req.body.remarks;

        // 有ID就视为修改
        if (typeof (req.body.id) != 'undefined' && req.body.id != '') {
          userDao.updateUser(req, function (err, result) {
            if (err || !result) {
              cb(null, false);
            } else {
              cb(null, result);
            }
          });
        } else {
          dictDao.saveDict(value, label, type, description, sort, remarks, req, function (err, result) {
            if (err || !result) {
              cb(null, false);
            } else {
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
          error: '登录名重复请修改登录名'
        });
      }
    });
  });

  /**
   *  删除一个字典信息
   */
  routeMethod.session('/manage/dict/delete','sys:dict:edit');
  app.all('/manage/dict/delete', function (req, res) {
    async.auto({
      delUser: function (cb) {
        if (req.body.id) {
          let id = req.body.id;
          dictDao.delDictById(id, function (err, result) {
            if (err || !result) {
              cb(null, false);
            } else {
              cb(null, result);
            }
          });
        } else {
          let ids = req.body.ids;
          let idsAry = ids.split('|');

          async.map(idsAry, function (id, idCallBack) {
            dictDao.delDictById(id, function (err, result) {
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
  });
  routeMethod.session('/manage/dict','sys:dict:show');
  app.all('/manage/dict', function (req, res) {
    var currentPage = req.query.page ? req.query.page : 1; // 获取当前页数，如果没有则为1
    async.auto({
      dicts: function (cb) {
        dictDao.queryAllDict(req, currentPage, 20, function (err, dicts) {
          if (err || !dicts) {
            cb(null, false);
          } else {
            cb(null, dicts);
          }
        });
      },
      // 查询用户数量
      dictsPage: ['dicts', function (params, cb) {
        dictDao.queryAllDictPage(req, 20, currentPage, function (err, usersPage) {
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
      dictTypes: function (cb) {
        dictDao.queryDictType(function (err, dictTypes) {
          if (err || !dictTypes) {
            cb(null, false);
          } else {
            cb(null, dictTypes);
          }
        });
      }
    }, function (error, result) {

      res.render('manage/dict/index', {
        currentMenu: result.currentMenu,
        dicts: result.dicts,
        page: result.dictsPage,
        dictTypes: result.dictTypes
      });
    });
  });
};