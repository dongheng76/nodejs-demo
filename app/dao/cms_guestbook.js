const mysql = require('../utils/mysql_db.js');
const util = require('../utils');



/**
 * 分页查询文章所有信息
 */
exports.queryAllGuestbook = function (cateId,req, currentPage, pagesize) {
    let where = " where cg.category_id=? and cg.del_flag='0' ";
    let order = ' order by ';
    let params = [];

    params.push(cateId);
    if (req.query.title != null && req.query.title != '') {
        where += " and cg.title like '%" + req.query.title + "%'";
    }
    if (req.query.create_date_start != null && req.query.create_date_start != '') {
        where += ' and cg.create_date>=?';
        params.push(req.query.create_date_start);
    }
    if (req.query.create_date_end != null && req.query.create_date_end != '') {
        where += ' and cg.create_date<=?';
        params.push(req.query.create_date_end);
    }
    if (typeof (req.query.sortName) != 'undefined' && typeof (req.query.sortOrder) != 'undefined') {
        order += ' cg.' + req.query.sortName + ' ' + req.query.sortOrder;
    } else {
        order += ' cg.create_date desc';
    }

    return mysql.query(`
        select * from cms_guestbook cg
    ` + where
        + order + ' limit ' + (parseInt(currentPage) - 1) * pagesize + ',' + pagesize,
        params);
};

/**
 * 查询文章所有信息的记录数
 */
exports.queryAllGuestbookPage = async function (cateId,req, pagesize, currentPage) {
    let where = " where cg.category_id=? and cg.del_flag='0' ";
    let params = [];

    params.push(cateId);
    if (req.query.title != null && req.query.title != '') {
        where += " and cg.title like '%" + req.query.title + "%'";
    }
    if (req.query.create_date_start != null && req.query.create_date_start != '') {
        where += ' and cg.create_date>=?';
        params.push(req.query.create_date_start);
    }
    if (req.query.create_date_end != null && req.query.create_date_end != '') {
        where += ' and cg.create_date<=?';
        params.push(req.query.create_date_end);
    }

    let val = await mysql.queryOne('select count(*) as total from cms_guestbook cg ' + where, params);

    return util.makePage(util.getSingleUrl(req), val.total, pagesize, currentPage);
};

