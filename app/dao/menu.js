const mysql = require('../utils/mysql_db.js');
const util = require('../utils');
const async = require('async');

/**
 * 根据菜单ID删除一个菜单
 */
exports.delMenuById = function (id, callback) {
    mysql.update("update sys_menu set del_flag='1' where id=? or parent_ids like '%" + id + "%'", [id], function (err, result) {
        callback(err, result);
    });
};

/**
 * 根据菜单ID查询菜单信息
 */
exports.queryMenuById = function (id, callback) {
    mysql.queryOne('select sm.* from sys_menu sm where sm.id = ?', [id], function (err, menu) {
        callback(err, menu);
    });
};

/**
 * 根据地址查询菜单信息
 */
exports.queryMenuByHref = function (href, callback) {
    mysql.queryOne("select sm.* from sys_menu sm where sm.href = ? and sm.del_flag='0'", [href], function (err, menus) {
        callback(err, menus);
    });
};

/**
 * 递归查询菜单信息
 */
exports.queryMenuForRecursion = function (callback) {
    mysql.query("select * from sys_menu where del_flag='0'", [null], function (err, menus) {
        callback(err, util.jsonToTreeJson(menus));
    });
};

/**
 * 非递归查询菜单信息
 */
exports.queryMenus = function (callback) {
    mysql.query("select * from sys_menu where del_flag='0'", [null], function (err, menus) {
        callback(err, menus);
    });
};

/**
 * 根据父亲ID查询孩子中最大的sort
 */
exports.querySortMaxByPId = function (pId , callback) {
    mysql.queryOne('select max(sort) as sort from sys_menu where parent_id=?', [pId], function (err, result) {
        callback(err, result.sort);
    });
};

/**
 * 插入一条菜单信息
 */
exports.saveMenu = function (parent_id, name, sort, href,icon, permission, remarks, req, callback) {
    // 先根据父亲id查询父亲信息
    mysql.queryOne('select * from sys_menu where id=?',[parent_id],function (er,parentMenu){
        // 取得用户信息
        let user = req.session.user;
        let menuId = util.uuid();
        mysql.update('insert into sys_menu(id,parent_id,parent_ids,name,sort,href,icon,permission,create_by,create_date,update_by,update_date,remarks,del_flag)'
            + ' values(?,?,?,?,?,?,?,?,?,now(),?,now(),?,0)',
            [menuId, parent_id, parentMenu.parent_ids + parentMenu.id + ',', name, sort, href, icon, permission, user.id, user.id, remarks], function (err, result) {
                callback(err, result);
            });
    });
};

/**
 * 修改一条菜单信息
 */
exports.updateMenu = function (req, callback) {
    // 需要修改的字符串集
    let sets = '';
    if (req.body.name) {
        sets += ",name='" + req.body.name + "'";
    }
    if (req.body.password) {
        sets += ',sort=' + req.body.sort ;
    }
    if (req.body.href) {
        sets += ",href='" + req.body.href + "'";
    }
    if (req.body.icon) {
        sets += ",icon='" + req.body.icon + "'";
    }
    if (req.body.permission) {
        sets += ",permission='" + req.body.permission + "'";
    }
    if (req.body.remarks) {
        sets += ",remarks='" + req.body.remarks + "'";
    }

    mysql.update('update sys_menu set update_date=now() ' + sets + ' where id=?', [req.body.id], function (err, result) { 
        callback(err, result);
    });
};