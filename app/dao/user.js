var mysql = require('../utils/mysql_db.js');
var util = require('../utils');

/**
 * 根据用户的用户名和密码查询用户信息
 */
exports.queryUserByUserNameAndPwd = function(loginName,password,callback) {
    mysql.queryOne('select * from sys_user where login_name=? and password=?', [ loginName,password ], function(err,sysuser) {
        callback(err, sysuser);
    });
};

/**
 * 根据用户ID查询菜单信息
 */
exports.queryUserMenuAuthority = function(userId, callback) {
    mysql.query('SELECT DISTINCT sm.* FROM sys_user su LEFT JOIN sys_user_role sur ON su.id = sur.user_id left join sys_role_menu srm on sur.role_id = srm.role_id left join sys_menu sm on srm.menu_id=sm.id where su.id=?  order by sm.sort asc',
    [ userId ], function(err, sysmenus) {
        callback(err, sysmenus);
    });
};

/**
 * 分页查询用户所有信息
 */
exports.queryAllUser = function(req,currentPage,pagesize,callback) {
    let where = "where su.del_flag=0 ";
    let params = [];
    if(req.query.name!=null && req.query.name!=""){
        where += " and su.name like '%"+req.query.name+"%'";
    }
    if(req.query.login_name!=null && req.query.login_name!=""){
        where += " and su.login_name like '%"+req.query.login_name+"%'";
    }
    if(req.query.create_date_start!=null && req.query.create_date_start!=""){
        where += " and su.create_date>=?";
        params.push(req.query.create_date_start);
    }
    if(req.query.create_date_end!=null && req.query.create_date_end!=""){
        where += " and su.create_date<=?";
        params.push(req.query.create_date_end);
    }

    mysql.query("select su.*,so.name as office_name from sys_user su left join sys_office so on su.office_id=so.id "+where
        +" order by su.update_date desc limit " + (parseInt(currentPage) - 1) * pagesize + "," + pagesize,
        params, function(err, users) {
        callback(err, users);
    });
};

/**
 * 查询用户所有信息的记录数
 */
exports.queryAllUserPage = function(req,pagesize,currentPage,callback) {
    let where = "where su.del_flag=0 ";
    let params = [];
    if(req.query.name!=null && req.query.name!=""){
        where += " and su.name like '%"+req.query.name+"%'";
    }
    if(req.query.login_name!=null && req.query.login_name!=""){
        where += " and su.login_name like '%"+req.query.login_name+"%'";
    }
    if(req.query.create_date_start!=null && req.query.create_date_start!=""){
        where += " and su.create_date>=?";
        params.push(req.query.create_date_start);
    }
    if(req.query.create_date_end!=null && req.query.create_date_end!=""){
        where += " and su.create_date<=?";
        params.push(req.query.create_date_end);
    }

    mysql.queryOne("select count(*) as total from sys_user su "+where,params, function(err, val) {
        callback(err,util.makePage(util.getSingleUrl(req),val.total,pagesize,currentPage));
    });
};