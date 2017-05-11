const mysql = require('../utils/mysql_db.js');
const util = require('../utils');
const URL = require('url');

/**
 * 插入一条日志信息
 */
exports.saveLog = function(type,title,req,callback) {
    //取得用户信息
    let user = req.session.user;
    let p = URL.parse(req.url);

    mysql.update('insert into sys_log(id,type,title,create_by,create_date,remote_addr,user_agent,request_uri,method,params,exception) values(?,?,?,?,now(),?,?,?,?,?,?)',
        [ util.uuid(),type,title,user.id, req.hostname,req.headers['user-agent'], req.originalUrl,'post',p.query,''], function(err,result) {
        callback(err, result);
    });
};

/**
 * 查询日志信息
 */
exports.queryUserMenuAuthority = function(userId, callback) {
    mysql.query('SELECT DISTINCT sm.* FROM sys_user su LEFT JOIN sys_user_role sur ON su.id = sur.user_id left join sys_role_menu srm on sur.role_id = srm.role_id left join sys_menu sm on srm.menu_id=sm.id where su.id=?',
            [ userId ], function(err, sysmenus) {
                callback(err, sysmenus);
            });
};

function getClientIp(req) {
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
};