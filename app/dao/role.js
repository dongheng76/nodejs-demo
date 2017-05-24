const mysql = require('../utils/mysql_db.js');
const util = require('../utils');
const moment = require('moment');
const dictUtil = require('../utils/dict_utils');
const areaDao = require('./area');
const async = require('async');

/**
 * 根据角色ID查询角色信息
 */
exports.queryRoleById = function (id, callback) {
    mysql.queryOne('select sr.* from sys_role sr where sr.id=?', [id], function (err, role) {
        callback(err, role);
    });
};

/**
 * 根据角色ID查询角色菜单信息
 */
exports.queryRoleMenusById = function (id, callback) {
    mysql.query('select sm.* from sys_role_menu srm left join sys_menu sm on srm.menu_id=sm.id where srm.role_id=?', [id], function (err, menus) {
        callback(err, menus);
    });
};

/**
 * 根据角色ID删除一个角色
 */
exports.delRoleById = function (id, callback) {
    mysql.update("update sys_role set del_flag='1' where id=?", [id], function (err, result) {
        callback(err, result);
    });
};

/**
 * 分页查询字典所有信息
 */
exports.queryAllRole = function (req, currentPage, pagesize, callback) {
    let where = "where sr.del_flag='0' ";
    let params = [];
    if (req.query.data_scope != null && req.query.data_scope != '') {
        where += ' and sr.data_scope=?';
        params.push(req.query.data_scope);
    }
    mysql.query('select sr.*,so.name as office_name from sys_role sr left join sys_office so on sr.office_id=so.id ' + where
        + ' order by sr.update_date desc limit ' + (parseInt(currentPage) - 1) * pagesize + ',' + pagesize,
        params, function (err, users) {
            callback(err, users);
        });
};

/**
 * 查询用户所有信息的记录数
 */
exports.queryAllRolePage = function (req, pagesize, currentPage, callback) {
    let where = "where sr.del_flag='0' ";
    let params = [];
    if (req.query.data_scope != null && req.query.data_scope != '') {
        where += ' and sr.data_scope=?';
        params.push(req.query.data_scope);
    }
    mysql.queryOne('select count(*) as total from sys_role sr ' + where, params, function (err, val) {
        callback(err, util.makePage(util.getSingleUrl(req), val.total, pagesize, currentPage));
    });
};

/**
 * 插入一条角色信息
 */
exports.saveRole = function (office_id, name, enname, data_scope, is_sys, useable, remarks, req, callback) {
    // 取得角色信息
    let user = req.session.user;
    let roleId = util.uuid();
    mysql.update('insert into sys_role(id,office_id,name,enname,data_scope,is_sys,useable,create_by,create_date,update_by,update_date,remarks,del_flag)'
        + 'values(?,?,?,?,?,?,?,?,now(),?,now(),?,0)',
        [roleId, office_id, name, enname, data_scope, is_sys, useable, user.id, user.id, remarks], function (err, result) {
            // 成功插入角色信息后开始插入角色菜单信息
            let menuIds = req.query.menuIds.split(',');

            async.map(menuIds, function (menuId, roleCallback) {
                mysql.update('insert into sys_role_menu(role_id,menu_id) values(?,?)', [roleId, menuId], function (err, result) {
                    roleCallback(null, result);
                });
            }, function (err, result) {
                callback(err, result);
            });
        });
};

/**
 * 修改一条角色信息
 */
exports.updateRole = function (req, callback) {
    // 需要修改的字符串集
    let sets = '';
    if (req.body.office_id) {
        sets += ",office_id='" + req.body.office_id + "'";
    }
    if (req.body.name) {
        sets += ",name='" + req.body.name + "'";
    }
    if (req.body.enname) {
        sets += ",enname='" + req.body.enname + "'";
    }
    if (req.body.data_scope) {
        sets += ",data_scope='" + req.body.data_scope + "'";
    }
    if (req.body.is_sys) {
        sets += ",is_sys='" + req.body.is_sys + "'";
    }
    if (req.body.useable) {
        sets += ",useable='" + req.body.useable + "'";
    }
    if (req.body.remarks) {
        sets += ",remarks='" + req.body.remarks + "'";
    }

    console.log('update sys_role set update_date=now() ' + sets + ' where id=?');

    mysql.update('update sys_role set update_date=now() ' + sets + ' where id=?', [req.body.id], function (err, result) {
        // 修改成功后把角色菜单信息删除后再次插入
        mysql.update('delete from sys_role_menu where role_id=?', [req.body.id], function (err, result) {
            // 成功删除角色菜单信息后开始插入新的角色菜单信息
            let menuIds = req.query.menuIds.split(',');
 
            async.map(menuIds, function (role, roleCallback) {
                mysql.update('insert into sys_role_menu(role_id,menu_id) values(?,?)', [req.body.id, role], function (err, result) {
                    roleCallback(null, result);
                });
            }, function (err, result) {
                callback(err, result);
            });
        });
    });
};
