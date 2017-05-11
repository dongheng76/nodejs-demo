var mysql = require('../utils/mysql_db.js');
var util = require('../utils');

/**
 * 根据用户的用户名和密码查询用户信息
 */
exports.queryMenuByHref = function(href,callback) {
    mysql.queryOne("select sm.* from sys_menu sm where sm.href = ? and sm.del_flag='0'", [ href ], function(err,menus) {
        callback(err, menus);
    });
};