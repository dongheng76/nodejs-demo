const mysql = require('../utils/mysql_db.js');
const util = require('../utils');
const async = require('async');

/**
 * 根据用户的用户名和密码查询用户信息
 */
exports.queryMenuByHref = function(href,callback) {
    mysql.queryOne("select sm.* from sys_menu sm where sm.href = ? and sm.del_flag='0'", [ href ], function(err,menus) {
        callback(err, menus);
    });
};

/**
 * 递归查询菜单信息
 */
exports.queryMenuForRecursion = function(callback) {
    mysql.query("select * from sys_menu where del_flag='0'", [ null ], function(err,menus) {
        callback(err,util.jsonToTreeJson(menus));
    });
};

