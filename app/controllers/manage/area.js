'use strict';

/**
 * Module dependencies.
 */
const async = require('async');
const validator = require('validator');
const menuDao = require('../../dao/menu');
const areaDao = require('../../dao/area');
const dictUtil = require('../../utils/dict_utils');


module.exports = function (app, permission) {
  // 设置权限
  permission('/manage/area', '1234');
  app.all('/manage/area', function (req, res) {
    async.auto({
      areas: function (cb) {
        areaDao.queryAreasByPId('0', function (err, areas) {
          if (err || !areas) {
            cb(null, false);
          } else {
            cb(null, areas);
          }
        });
      },
      currentMenu: function (cb) {
        menuDao.queryMenuByHref("/manage/area", function (err, menu) {
          if (err || !menu) {
            cb(null, false);
          } else {
            cb(null, menu);
          }
        });
      }
    }, function (error, result) {
      let areas = result.areas;

      res.render('manage/area/index', {
        currentMenu: result.currentMenu,
        areas: JSON.stringify(areas)
      });
    });
  });

  app.all('/manage/area/findareabypid', function (req, res) {
    async.auto({
      areas: function (cb) {
        areaDao.queryAreasByPId(req.body.parent_id, function (err, areas) {
          if (err || !areas) {
            cb(null, false);
          } else {
            cb(null, areas);
          }
        });
      }
    }, function (error, result) {
      res.json(result.areas);
    });
  });

  app.all('/manage/area/create', function (req, res) {
    async.auto({
      areaTypes: function (cb) {
        dictUtil.getDictList('sys_area_type', function (err, areaTypes) {
          cb(null, areaTypes);
        });
      },
      currentMenu: function (cb) {
        menuDao.queryMenuByHref("/manage/area", function (err, menu) {
          if (err || !menu) {
            cb(null, false);
          } else {
            cb(null, menu);
          }
        });
      },
      parentAreaInfo: function (cb) {
        areaDao.queryAreaById(req.query.parent_id, function (err, area) {
          if (err || !area) {
            cb(null, false);
          } else {
            cb(null, area);
          }
        });
      },
      maxSort: function (cb) {
        areaDao.queryChildrenMaxSort(req.query.parent_id, function (err, maxSort) {
          if (err || !maxSort) {
            cb(null, 0);
          } else {
            cb(null, maxSort);
          }
        });
      }
    }, function (error, result) {
      res.render('manage/area/create', {
        currentMenu: result.currentMenu,
        areaTypes: result.areaTypes,
        parentAreaInfo: result.parentAreaInfo,
        currentSort: parseInt(result.maxSort) + 10
      });
    });
  });

  /**
   *  保存一个区域信息
   */
  app.all('/manage/area/store', function (req, res) {
    async.auto({
      store: function (cb) {
        let parent_id = req.body.parent_id;
        let name = req.body.name;
        let sort = req.body.sort;
        let code = req.body.code;
        let type = req.body.type;
        let remarks = req.body.remarks;

        // 有ID就视为修改
        if (typeof (req.body.id) != 'undefined' && req.body.id != '') {
          areaDao.updateArea(req, function (err, result) {
            if (err || !result) {
              cb(null, false);
            } else {
              cb(null, result);
            }
          });
        } else {
          areaDao.saveArea(parent_id, name, sort, code, type, remarks, req, function (err, result) {
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
   * 编辑区域
   */
  app.all('/manage/area/edit', function (req, res) {
    let id = req.query.id;

    async.auto({
      areaTypes: function (cb) {
        dictUtil.getDictList('sys_area_type', function (err, areaTypes) {
          cb(null, areaTypes);
        });
      },
      currentMenu: function (cb) {
        menuDao.queryMenuByHref("/manage/area", function (err, menu) {
          if (err || !menu) {
            cb(null, false);
          } else {
            cb(null, menu);
          }
        });
      },
      area: function (cb) {
        areaDao.queryAreaById(req.query.id, function (err, area) {
          if (err || !area) {
            cb(null, false);
          } else {
            cb(null, area);
          }
        });
      },
      parentAreaInfo: ['area', function (param, cb) {
        areaDao.queryAreaById(param.area.parent_id, function (err, area) {
          if (err || !area) {
            cb(null,false);
          } else {
            cb(null, area);
          }
        });
      }]
    }, function (error, result) {
      res.render('manage/area/create', {
        currentMenu: result.currentMenu,
        areaTypes: result.areaTypes,
        area: result.area,
        parentAreaInfo: result.parentAreaInfo
      });
    });
  });

  /**
   *  删除一个用户信息
   */
  app.all('/manage/area/delete', function (req, res) {
    async.auto({
      delArea: function (cb) {
        let id = req.body.id;
        areaDao.delAreaById(id, function (err, result) {
          if (err || !result) {
            cb(null,false);
          } else {
            cb(null, result);
          }
        });
      }
    }, function (error, result) {
      if (result.delArea) {
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
};