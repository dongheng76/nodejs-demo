const mysql = require('../utils/mysql_db.js');
const util = require('../utils');
const async = require('async');

/**
 * 根据字典ID查询字典信息
 */
exports.queryDictById = function (id) {
    return mysql.queryOne('select * from sys_dict where id=?', [id]);
};

/**
 * 根据用户ID查询用户角色信息
 */
exports.queryUserRolesById = function (id) {
    return mysql.query('select sr.* from sys_user_role sur left join sys_role sr on sur.role_id=sr.id where sur.user_id=?', [id]);
};

/**
 * 根据字典ID删除一个字典信息
 */
exports.delDictById = function (id) {
    return mysql.update("update sys_dict set del_flag='1' where id=?", [id]);
};

/**
 * 根据用户登录名查询用户信息
 */
exports.queryMaxSortByType = async function (type) {
    let result = await mysql.queryOne("select max(sd.sort) as sort from sys_dict sd where sd.del_flag='0' and sd.type=?", [type]);
    return result.sort;
};

/**
 * 查询所有有效的字典类型
 */
exports.queryDictType = function () {
    return mysql.query("select DISTINCT sd.type,sd.type as value,sd.type as label from sys_dict sd where sd.del_flag='0'",
        []);
};

/**
 * 分页查询字典所有信息
 */
exports.queryAllDict = function (req, currentPage, pagesize, callback) {
    let where = "where sd.del_flag='0' ";
    let params = [];
    if (req.query.type != null && req.query.type != '') {
        where += ' and sd.type=?';
        params.push(req.query.type);
    }

    return mysql.query('select sd.* from sys_dict sd ' + where
        + ' order by sd.update_date desc limit ' + (parseInt(currentPage) - 1) * pagesize + ',' + pagesize,
        params);
};

/**
 * 查询用户所有信息的记录数
 */
exports.queryAllDictPage = async function (req, pagesize, currentPage) {
    let where = 'where sd.del_flag=0 ';
    let params = [];
    if (req.query.type != null && req.query.type != '') {
        where += ' and sd.type=?';
        params.push(req.query.type);
    }
    
    let val = await mysql.queryOne('select count(*) as total from sys_dict sd ' + where, params);
    return util.makePage(util.getSingleUrl(req), val.total, pagesize, currentPage);
};

/**
 * 插入一条字典信息
 */
exports.saveDict = function (value, label, type, description, sort, remarks, req, callback) {
    // 取得用户信息
    let user = req.session.user;
    let id = util.uuid();
    return mysql.update('insert into sys_dict(id,value,label,type,description,sort,parent_id,create_by,create_date,update_by,update_date,remarks,del_flag)'
        + "values(?,?,?,?,?,?,'0',?,now(),?,now(),?,'0')",
        [id, value, label, type, description, sort, user.id,user.id, remarks]);
};

/**
 * 修改一条用户信息
 */
exports.updateDict = function (req, callback) {
    // 需要修改的字符串集
    let sets = '';
    if (req.body.value) {
        sets += ",value='" + req.body.value + "'";
    }
    if (req.body.label) {
        sets += ",label='" + req.body.label + "'";
    }
    if (req.body.type) {
        sets += ",type='" + req.body.type + "'";
    }
    if (req.body.description) {
        sets += ",description='" + req.body.description + "'";
    }
    if (req.body.sort) {
        sets += ",sort='" + req.body.sort + "'";
    }
    if (req.body.remarks) {
        sets += ",remarks='" + req.body.remarks + "'";
    }

    return mysql.update('update sys_user set update_date=now() ' + sets + ' where id=?', [req.body.id]);
};
