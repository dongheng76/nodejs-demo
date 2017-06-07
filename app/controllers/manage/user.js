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
const excelPort = require('excel-export');
const xlsx = require('node-xlsx');
const fs = require('fs.extra');
const uuidV1 = require('uuid/v1');
const path = require('path');


exports.PERMISSION = {};


exports.ROUTER = {
  /**
   * 创建用户
   */
  '/manage/user/create': function (req, res) {

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
      userTypes: function (cb) {
        dictUtil.getDictList('sys_user_type', function (err, userTypes) {
          cb(null, userTypes);
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
      }
    }, function (error, result) {

      res.render('manage/user/create', {
        currentMenu: result.currentMenu,
        userTypes: result.userTypes,
        roles: result.roles,
        offices: JSON.stringify(result.offices)
      });
    });
  },
  /**
   * 编辑用户
   */
  '/manage/user/edit': function (req, res) {
    let id = req.query.id;

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
      userTypes: function (cb) {
        dictUtil.getDictList('sys_user_type', function (err, userTypes) {
          cb(null, userTypes);
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
      userInfo: function (cb) {
        userDao.queryUserById(id, function (err, user) {
          cb(null, user);
        });
      },
      userRoles: function (cb) {
        userDao.queryUserRolesById(id, function (err, roles) {
          cb(null, roles);
        });
      }
    }, function (error, result) {
      res.render('manage/user/create', {
        currentMenu: result.currentMenu,
        userTypes: result.userTypes,
        roles: result.roles,
        offices: JSON.stringify(result.offices),
        userInfo: result.userInfo,
        userRoles: result.userRoles
      });
    });
  },
  /**
   *  显示用户详情
   */
  '/manage/user/show': function (req, res) {

  },
  /**
   *  保存一个用户信息
   */
  '/manage/user/store': function (req, res) {
    async.auto({
      store: function (cb) {
        let office_id = req.body.office_id;
        let login_name = req.body.login_name;
        let password = req.body.password;
        let no = req.body.no;
        let name = req.body.name;
        let email = req.body.email;
        let phone = req.body.phone;
        let mobile = req.body.mobile;
        let user_type = req.body.user_type;
        let photo = req.body.photo;
        let login_flag = req.body.login_flag;
        let remarks = req.body.remarks;

        // 登录名不能重复
        userDao.queryUserByLoginId(login_name, function (err, user) {
          if (typeof (user) != 'undefined' && user.id != null) {
            cb(null, false);
          } else {
            // 有ID就视为修改
            if (typeof (req.body.id) != 'undefined' && req.body.id != '') {
              userDao.updateUser(req, function (err, result) {
                cb(null, result);
              });
            } else {
              userDao.saveUser(office_id, login_name, password, no, name, email, phone, mobile, user_type, photo, login_flag, remarks, req, function (err, result) {
                cb(null, result);
              });
            }
          }
        });
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
   *  删除一个用户信息
   */
  '/manage/user/delete': function (req, res) {
    async.auto({
      delUser: function (cb) {

        if (req.body.id) {
          let id = req.body.id;
          userDao.delUserById(id, function (err, result) {
            cb(null, result);
          });
        } else {
          let ids = req.body.ids;
          let idsAry = ids.split('|');

          async.map(idsAry, function (id, idCallBack) {
            userDao.delUserById(id, function (err, result) {
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
  '/manage/user': function (req, res) {
    var currentPage = req.query.page ? req.query.page : 1; // 获取当前页数，如果没有则为1
    async.auto({
      users: function (cb) {
        userDao.queryAllUser(req, currentPage, 20, function (err, users) {
          if (err || !users) {
            cb(null, []);
          } else {
            async.map(users, function (user, userCallback) {
              user.create_date = moment(user.create_date).format('YYYY-MM-DD HH:mm:ss');
              dictUtil.getDictLabel(user.user_type, 'sys_user_type', '未知', function (err, label) {
                user.user_type_label = label;
                userCallback(null, user);
              });
            }, function (err, result) {
              cb(null, result);
            });
          }
        });
      },
      // 查询用户数量
      usersPage: ['users', function (params, cb) {
        userDao.queryAllUserPage(req, 20, currentPage, function (err, usersPage) {
          if (err || !usersPage) {
            cb(null, {});
          } else {
            cb(null, usersPage);
          }
        });
      }],
      currentMenu: function (cb) {
        menuDao.queryMenuByHref('/manage/user', function (err, menu) {
          if (err || !menu) {
            cb(null, {});
          } else {
            cb(null, menu);
          }
        });
      }
    }, function (error, result) {
      res.render('manage/user/index', {
        currentMenu: result.currentMenu,
        users: result.users,
        page: result.usersPage,
        condition: req.query
      });
    });
  },
  /**
  *  导出EXCEL
  */
  '/manage/user/downloadExcel': function (req, res) {
     var currentPage = req.query.page ? req.query.page : 1; // 获取当前页数，如果没有则为1
     // var datas = req.datas;
      async.auto({
        users: function (cb) {
          userDao.queryAllUser(req, currentPage, 100, function (err, users) {
            if (err || !users) {
              cb(null, []);
            } else {
              async.map(users, function (user, userCallback) {
                user.create_date = moment(user.create_date).format('YYYY-MM-DD HH:mm:ss');
                dictUtil.getDictLabel(user.user_type, 'sys_user_type', '未知', function (err, label) {
                  user.user_type_label = label;
                  userCallback(null, user);
                });
              }, function (err, result) {
                cb(null, result);
              });
            }
          });
        }
      }, function (error, result) {
          var userList= result.users;
          var conf ={};
          conf.cols = [
              {caption:'用户ID', type:'string'},
              {caption:'姓名 ', type:'string'},
              {caption:'登录名', type:'string'},
              {caption:'用户email', type:'string'},               
              {caption:'所属机构', type:'string'},               
              {caption:'注册日期', type:'string'},               
              {caption:'用户mobile', type:'string'},               
              {caption:'用户类型 ', type:'string'}            
          ];
          conf.rows = [];
          for(var i=0;i<userList.length;i++){
            conf.rows[conf.rows.length]=[userList[i].id, userList[i].name,userList[i].login_name,userList[i].email, userList[i].office_name, userList[i].create_date, userList[i].mobile, userList[i].user_type_label];
         }
          res.setHeader('Content-Type', 'application/vnd.openxmlformats');
          res.setHeader("Content-Disposition", "attachment; filename=user" +new Date().getTime()+ ".xlsx");
          res.end(excelPort.execute(conf), 'binary');
    });
  },
  '/manage/user/uploadExcel': function (req, res) {
    //先上传临时文件 再读取 然后删除临时文件
    if (!req.files)
            return res.status(400).send('No files were uploaded.');
    let file = req.files.file;
    // 取得文件的后缀名
    let fileAry = file.name.split('.');
    let suffix = fileAry[fileAry.length - 1];
    var fileName = 'user'+new Date().getTime();
    let fileDirPath = path.resolve(__dirname, '../../../') + '/public/files/temporaryFile/';
   
    if (fs.existsSync(fileDirPath)) {
        // 不做操作
    } else {
        util.mkdirsSync(fileDirPath);
    }
    var filePath=(fileDirPath + fileName + '.' + suffix).replace(/\\/g,'/');;
    file.mv(filePath, function (err) {
          if (err){
              return res.status(500).send(err);
          }
          var obj = xlsx.parse(filePath);
          var excelObj=obj[0].data;
          console.log(excelObj);
          return true;
     });

    return false;
     

    //var obj = xlsx.parse("C:\\Users\\Administrator\\Desktop\\user1496288617654.xlsx");
  }
};