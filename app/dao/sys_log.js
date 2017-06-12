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
/**
 * 分页查询所有信息
 */
exports.queryAllLogs = function (req, currentPage, pagesize) {
    let where = 'where 1=1 ';
    let params = [];
    //if (req.query.type != null && req.query.type != '') {
    //    where += ' and sl.type=?';
    //    params.push(req.query.type);
   // }
    if (req.query.create_date_start != null && req.query.create_date_start != "") {
        where += ' and sl.create_date>=?';
        params.push(req.query.create_date_start);
    }
    if (req.query.create_date_end != null && req.query.create_date_end != "") {
        where += ' and sl.create_date<=?';
        params.push(req.query.create_date_end);
    }
    return mysql.query('select sl.*,su.name,su.login_name from sys_log sl left join sys_user su on sl.create_by=su.id ' + where
        + ' order by sl.create_date desc limit ' + (parseInt(currentPage) - 1) * pagesize + ',' + pagesize,
        params);
};

/**
 * 查询记录数
 */
exports.queryAllLogPage =  async function (req, pagesize, currentPage) {
    let where = 'where 1=1 ';
    let params = [];
    //if (req.query.type != null && req.query.type != '') {
    //   where += ' and sd.type=?';
//    params.push(req.query.type);
   // }
   if (req.query.create_date_start != null && req.query.create_date_start != '') {
        where += ' and sl.create_date>=?';
        params.push(req.query.create_date_start);
    }
    if (req.query.create_date_end != null && req.query.create_date_end != '') {
        where += ' and sl.create_date<=?';
        params.push(req.query.create_date_end);
    }
    let val = await mysql.queryOne('select count(*) as total from sys_log sl ' + where, params);
    return util.makePage(util.getSingleUrl(req), val.total, pagesize, currentPage);
};