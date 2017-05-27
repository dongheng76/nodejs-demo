const mysql = require('../utils/mysql_db.js');
const util = require('../utils');
const async = require('async');

/**
 * 根据用户ID查询用户信息
 */
exports.queryUserById = function (id, callback) {
    mysql.queryOne('select su.* from sys_user su where su.id=?', [id], function (err, sysuser) {
        callback(err, sysuser);
    });
};

/**
 * 根据用户ID查询用户角色信息
 */
exports.queryUserRolesById = function (id, callback) {
    mysql.query('select sr.* from sys_user_role sur left join sys_role sr on sur.role_id=sr.id where sur.user_id=?', [id], function (err, roles) {
        callback(err, roles);
    });
};

/**
 * 根据用户ID删除一个用户
 */
exports.delUserById = function (id, callback) {
    mysql.update("update sys_user set del_flag='1' where id=?", [id], function (err, result) {
        callback(err, result);
    });
};

/**
 * 根据用户登录名查询用户信息
 */
exports.queryUserByLoginId = function (login_name, callback) {
    mysql.queryOne('select * from sys_user where login_name=?', [login_name], function (err, sysuser) {
        callback(err, sysuser);
    });
};

/**
 * 根据用户的用户名和密码查询用户信息
 */
exports.queryUserByUserNameAndPwd = function (loginName, password, callback) {
    mysql.queryOne('select * from sys_user where login_name=? and password=?', [loginName, password], function (err, sysuser) {
        callback(err, sysuser);
    });
};

/**
 * 根据用户ID查询菜单信息
 */
exports.queryUserMenuAuthority = function (userId, callback) {
    mysql.query("SELECT DISTINCT sm.* FROM sys_user su LEFT JOIN sys_user_role sur ON su.id = sur.user_id left join sys_role_menu srm on sur.role_id = srm.role_id left join sys_menu sm on srm.menu_id=sm.id where su.id=? and sm.del_flag='0' order by sm.sort asc",
        [userId], function (err, sysmenus) {
            callback(err, sysmenus);
        });
};

/**
 * 分页查询用户所有信息
 */
exports.queryAllUser = function (req, currentPage, pagesize, callback) {
    let where = "where su.del_flag='0' ";
    let order = ' order by ';
    let params = [];
    if (req.query.name != null && req.query.name != '') {
        where += " and su.name like '%" + req.query.name + "%'";
    }
    if (req.query.login_name != null && req.query.login_name != '') {
        where += " and su.login_name like '%" + req.query.login_name + "%'";
    }
    if (req.query.create_date_start != null && req.query.create_date_start != '') {
        where += ' and su.create_date>=?';
        params.push(req.query.create_date_start);
    }
    if (req.query.create_date_end != null && req.query.create_date_end != '') {
        where += ' and su.create_date<=?';
        params.push(req.query.create_date_end);
    }
    if (typeof(req.query.sortName) != 'undefined' && typeof(req.query.sortOrder) != 'undefined'){
        order += ' su.' + req.query.sortName + ' ' + req.query.sortOrder;
    } else {
        order += ' su.update_date desc';
    }


    mysql.query('select su.*,so.name as office_name from sys_user su left join sys_office so on su.office_id=so.id ' + where
        + order + ' limit ' + (parseInt(currentPage) - 1) * pagesize + ',' + pagesize,
        params, function (err, users) {
            callback(err, users);
        });
};

/**
 * 查询用户所有信息的记录数
 */
exports.queryAllUserPage = function (req, pagesize, currentPage, callback) {
    let where = 'where su.del_flag=0 ';
    let params = [];
    if (req.query.name != null && req.query.name != '') {
        where += " and su.name like '%" + req.query.name + "%'";
    }
    if (req.query.login_name != null && req.query.login_name != '') {
        where += " and su.login_name like '%" + req.query.login_name + "%'";
    }
    if (req.query.create_date_start != null && req.query.create_date_start != '') {
        where += ' and su.create_date>=?';
        params.push(req.query.create_date_start);
    }
    if (req.query.create_date_end != null && req.query.create_date_end != '') {
        where += ' and su.create_date<=?';
        params.push(req.query.create_date_end);
    }

    mysql.queryOne('select count(*) as total from sys_user su ' + where, params, function (err, val) {
        callback(err, util.makePage(util.getSingleUrl(req), val.total, pagesize, currentPage));
    });
};

/**
 * 查询一个用户能够选择的角色集合信息
 */
exports.queryRolesForAuth = function (req, callback) {
    let user = req.session.user;

    mysql.query("select sr.* from sys_role sr where sr.is_sys = 1 or sr.office_id = ?",
        [user.office_id], function (err, roles) {
            callback(err, roles);
        });
};

/**
 * 插入一条用户信息
 */
exports.saveUser = function (office_id, login_name, password, no, name, email, phone, mobile, user_type, photo, login_flag, remarks, req, callback) {
    // 取得用户信息
    let user = req.session.user;
    let userId = util.uuid();
    mysql.update("insert into sys_user(id,office_id,login_name,password,no,name,email,phone,mobile,user_type,photo,login_ip,login_date,"
        + "login_flag,create_by,create_date,update_by,update_date,remarks,del_flag) values(?,?,?,?,?,?,?,?,?,?,?,?,now(),?,?,now(),?,now(),?,0)",
        [userId, office_id, login_name, util.md5(password), no, name, email, phone, mobile, user_type, photo, util.getIPAdress(), login_flag, user.id, user.id, remarks], function (err, result) {
            // 成功插入用户信息后开始插入角色信息
            async.map(req.body.role, function (role, roleCallback) {
                mysql.update("insert into sys_user_role(user_id,role_id) values(?,?)", [userId, role], function (err, result) {
                    roleCallback(null, result);
                });
            }, function (err, result) {
                callback(err, result);
            });
        });
};

/**
 * 修改一条用户信息
 */
exports.updateUser = function (req, callback) {
    // 需要修改的字符串集
    let sets = '';
    if (req.body.office_id) {
        sets += ",office_id='" + req.body.office_id + "'";
    }
    if (req.body.password) {
        sets += ",password='" + util.md5(req.body.password) + "'";
    }
    if (req.body.no) {
        sets += ",no='" + req.body.no + "'";
    }
    if (req.body.name) {
        sets += ",name='" + req.body.name + "'";
    }
    if (req.body.email) {
        sets += ",email='" + req.body.email + "'";
    }
    if (req.body.phone) {
        sets += ",phone='" + req.body.phone + "'";
    }
    if (req.body.mobile) {
        sets += ",mobile='" + req.body.mobile + "'";
    }
    if (req.body.user_type) {
        sets += ",user_type='" + req.body.user_type + "'";
    }
    if (req.body.photo) {
        sets += ",photo='" + req.body.photo + "'";
    }
    if (req.body.login_flag) {
        sets += ",login_flag='" + req.body.login_flag + "'";
    }
    if (req.body.remarks) {
        sets += ",remarks='" + req.body.remarks + "'";
    }

    mysql.update("update sys_user set update_date=now() " + sets + " where id=?", [req.body.id], function (err, result) {
        //修改成功后把用户角色信息删除后再次插入
        mysql.update("delete from sys_user_role where user_id=?", [req.body.id], function (err, result) {
            //成功插入用户信息后开始插入角色信息
            async.map(req.body.role, function (role, roleCallback) {
                mysql.update("insert into sys_user_role(user_id,role_id) values(?,?)", [req.body.id, role], function (err, result) {
                    roleCallback(null, result);
                });
            }, function (err, result) {
                callback(err, result);
            });
        });
    });
};

/**
 * 修改密码
 */
exports.updateUserPwd = function (loginName,password, callback) {
    mysql.update("update sys_user set update_date=now(), password='" + util.md5(password) + "' where login_name=?", [loginName], function (err, result) {
       callback(err, result);
    });
};