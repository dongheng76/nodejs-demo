const mysql = require('../utils/mysql_db.js');
const util = require('../utils');
const async = require('async');

/**
 * 分页查询用户所有信息
 */
exports.queryAllComment = function (req, currentPage, pagesize) {
    let where = " where cc.del_flag='0' ";
    let order = ' order by ';
    let params = [];
    if (req.query.title != null && req.query.title != '') {
        where += " and cc.title like '%" + req.query.title + "%'";
    }
    if (req.query.create_date_start != null && req.query.create_date_start != '') {
        where += ' and cc.create_date>=?';
        params.push(req.query.create_date_start);
    }
    if (req.query.create_date_end != null && req.query.create_date_end != '') {
        where += ' and cc.create_date<=?';
        params.push(req.query.create_date_end);
    }
    if (typeof (req.query.sortName) != 'undefined' && typeof (req.query.sortOrder) != 'undefined') {
        order += ' cc.' + req.query.sortName + ' ' + req.query.sortOrder;
    } else {
        order += ' cc.create_date desc';
    }
    return mysql.query('select cc.id,cc.category_id,cc.content_id,cc.title,cc.content,cc.name,cc.ip,cc.create_date,cc.audit_user_id,cc.audit_date,cc.del_flag from cms_comment cc' + where
        + order + ' limit ' + (parseInt(currentPage) - 1) * pagesize + ',' + pagesize , params);
};

/**
 * 查询用户所有信息的记录数
 */
exports.queryAllCommentPage = async function (req, pagesize, currentPage) {
     let where = " where cc.del_flag='0' ";
    let params = [];
    if (req.query.title != null && req.query.title != '') {
        where += " and cc.title like '%" + req.query.title + "%'";
    }
    if (req.query.create_date_start != null && req.query.create_date_start != '') {
        where += ' and cc.create_date>=?';
        params.push(req.query.create_date_start);
    }
    if (req.query.create_date_end != null && req.query.create_date_end != '') {
        where += ' and cc.create_date<=?';
        params.push(req.query.create_date_end);
    }

    let val = await mysql.queryOne('select count(*) as total from cms_comment cc ' + where , params);

    return util.makePage(util.getSingleUrl(req), val.total, pagesize, currentPage);
};

