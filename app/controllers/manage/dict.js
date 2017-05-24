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

/**
 * 创建字典
 */
exports.create = function (req, res) {
  let type = req.query.type;

  async.auto({
    currentMenu: function (cb) {
      menuDao.queryMenuByHref('/manage/user', function (err, menu) {
        if (err || !menu) {
          cb(null, {});
        } else {
          cb(null, menu);
        }
      });
    },
    dataScopes: function (cb) {
      dictUtil.getDictList('sys_data_scope', function (err, dataScopes) {
        cb(null, dataScopes);
      });
    },
    roles: function (cb) {
      userDao.queryRolesForAuth(req, function (err, roles) {
        cb(null, roles);
      });
    },
    offices: function (cb) {
      officeDao.queryOffice(function (err, offices) {
        cb(null, offices);
      });
    },
    maxSort: function (cb){
      if (typeof(type) != 'undefined'){
        dictDao.queryMaxSortByType(type,function (err,maxSort){
          cb(null,maxSort);
        });
      } else {
        cb(null,0);
      }
    }
  }, function (error, result) {

    res.render('manage/dict/create', {
      currentMenu: result.currentMenu,
      maxSort:result.maxSort + 10,
      type:type
    });
  });
};

/**
 * 编辑字典
 */
exports.edit = function (req, res) {
  let id = req.query.id;

  async.auto({
    currentMenu: function (cb) {
      menuDao.queryMenuByHref('/manage/dict', function (err, menu) {
        if (err || !menu) {
          cb(null, {});
        } else {
          cb(null, menu);
        }
      });
    },
    dict: function (cb){
      dictDao.queryDictById(id,function (err,dict){
        if (err || !dict) {
          cb(null, {});
        } else {
          cb(null, dict);
        }
      });
    }
  }, function (error, result) {
    res.render('manage/dict/create', {
      currentMenu: result.currentMenu,
      dict:result.dict
    });
  });
};

/**
 *  保存一个用户信息
 */
exports.store = function (req, res) {
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
          cb(null, result);
        });
      } else {
        dictDao.saveDict(value, label, type, description, sort, remarks, req, function (err, result) {
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
};

/**
 *  删除一个字典信息
 */
exports.delete = function (req, res) {
  async.auto({
    delUser: function (cb) {
      if (req.body.id) {
        let id = req.body.id;
        dictDao.delDictById(id, function (err, result) {
          cb(null, result);
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
};

exports.index = function (req, res) {
  var currentPage = req.query.page ? req.query.page : 1; // 获取当前页数，如果没有则为1
  async.auto({
    dicts: function (cb) {
      dictDao.queryAllDict(req, currentPage, 20, function (err, dicts) {
        if (err || !dicts) {
          cb(null, dicts);
        } else {
          cb(null, dicts);
        }
      });
    },
    // 查询用户数量
    dictsPage: ['dicts', function (params, cb) {
      dictDao.queryAllDictPage(req, 20, currentPage, function (err, usersPage) {
        if (err || !usersPage) {
          cb(null, {});
        } else {
          cb(null, usersPage);
        }
      });
    }],
    currentMenu: function (cb) {
      menuDao.queryMenuByHref('/manage/dict', function (err, menu) {
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
    }
  }, function (error, result) {

    res.render('manage/dict/index', {
      currentMenu: result.currentMenu,
      dicts: result.dicts,
      page: result.dictsPage,
      dictTypes: result.dictTypes
    });
  });
};
