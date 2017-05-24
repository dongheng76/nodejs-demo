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
const areaDao = require('../../dao/area');
const dictUtil = require('../../utils/dict_utils');
const moment = require('moment');
const co = require('co');

/**
 * 创建机构
 */
exports.create = function (req, res) {
  let pId = req.query.parent_id ? req.query.parent_id : '0';

  async.auto({
    currentMenu: function (cb) {
      menuDao.queryMenuByHref('/manage/office', function (err, menu) {
        if (err || !menu) {
          cb(null, {});
        } else {
          cb(null, menu);
        }
      });
    },
    officeTypes: function (cb) {
      dictUtil.getDictList('sys_office_type', function (err, officeTypes) {
        cb(null, officeTypes);
      });
    },
    // 查询第一级区域信息
    rootAreas: function (cb){
      areaDao.queryAreasByPId('0',function (err,areas){
        cb(null,areas);
      });
    },
    // 根据ID查询父亲机构信息
    parentOffice: function (cb){
      officeDao.queryOfficeById(pId,function (err,office){
        cb(null,office);
      });
    },
    // 根据父亲ID查询最大sort
    maxSort: function (cb){
      officeDao.queryMaxSortByPId(pId,function (err,sort){
        if (sort != null){
          cb(null,sort);
        } else {
          cb(null,0);
        }
      });
    }
  }, function (error, result) {
    res.render('manage/office/create', {
      currentMenu: result.currentMenu,
      officeTypes: result.officeTypes,
      parentOffice: result.parentOffice,
      maxSort: parseInt(result.maxSort) + 10,
      rootAreas: JSON.stringify(result.rootAreas)
    });
  });
};

/**
 * 编辑用户
 */
exports.edit = function (req, res) {
  let id = req.query.id;

  async.auto({
    currentMenu: function (cb) {
      menuDao.queryMenuByHref('/manage/office', function (err, menu) {
        if (err || !menu) {
          cb(null, {});
        } else {
          cb(null, menu);
        }
      });
    },
    officeTypes: function (cb) {
      dictUtil.getDictList('sys_office_type', function (err, officeTypes) {
        cb(null, officeTypes);
      });
    },
    // 查询第一级区域信息
    rootAreas: function (cb){
      areaDao.queryAreasByPId('0',function (err,areas){
        cb(null,areas);
      });
    },
    // 根据ID查询父亲机构信息
    office: function (cb){
      officeDao.queryOfficeById(id,function (err,office){
        cb(null,office);
      });
    },
    // 查询父级office信息
    parentOffice: ['office',function (param,cb){
      officeDao.queryOfficeById(param.office.parent_id,function (err,office){
        cb(null,office);
      });
    }],
    // 查询所属区域ID家谱名称
    areaName: ['office',function (param,cb){
      areaDao.queryAreaGenealById(param.office.area_id,function (err,area_label){
        cb(null,area_label);
      });
    }]
  }, function (error, result) {

    res.render('manage/office/create', {
      currentMenu: result.currentMenu,
      officeTypes: result.officeTypes,
      office: result.office,
      parentOffice: result.parentOffice,
      areaName: result.areaName,
      rootAreas: JSON.stringify(result.rootAreas)
    });
  });
};

/**
 *  显示用户详情
 */
exports.show = function (req, res) {

};

/**
 *  保存一个机构信息
 */
exports.store = function (req, res) {
  async.auto({
    store: function (cb) {
      let parent_id = req.body.parent_id;
      let name = req.body.name;
      let area_id = req.body.area_id;
      let type = req.body.type;
      let sort = req.body.sort;
      let master = req.body.master;
      let address = req.body.address;
      let phone = req.body.phone;
      let email = req.body.email;
      let fax = req.body.fax;
      let code = req.body.code;
      let remarks = req.body.remarks;

      // 有ID就视为修改
      if (typeof (req.body.id) != 'undefined' && req.body.id != '') {
        officeDao.updateOffice(req, function (err, result) {
          cb(null, result);
        });
      } else {
        officeDao.saveOffice(parent_id, name, sort, area_id,code, type,address,master,phone,fax,email, remarks, req,function (err,office){
          cb(null, office);
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
 *  删除一个机构信息
 */
exports.delete = function (req, res) {
  async.auto({
    delUser: function (cb) {

      if (req.body.id) {
        let id = req.body.id;
        officeDao.delOfficeById(id, function (err, result) {
          cb(null, result);
        });
      } else {
        cb(null, null);
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
  async.auto({
      currentMenu: function (cb) {
        menuDao.queryMenuByHref('/manage/office', function (err, menu) {
          if (err || !menu) {
            cb(null, {});
          } else {
            cb(null, menu);
          }
        });
      },
      offices: function (cb) {
        officeDao.queryOfficeForRecursion(function (err, offices) {
          cb(null, offices);
        });
      }
    }, function (error, result) {
      res.render('manage/office/index', {
        currentMenu: result.currentMenu,
        offices: result.offices
      });
    });
};
