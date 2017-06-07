const mysql = require('../utils/mysql_db.js');
const util = require('../utils');
const moment = require('moment');
const async = require('async');

/**
 * 根据文章ID查询文章信息
 */
exports.queryArtcleById = async function (id) {
    return mysql.queryOne('select ca.*,cad.* from cms_article ca left join cms_article_data cad on ca.id=cad.id where ca.id=?', [id]);
};

/**
 * 根据文章ID删除一个文章
 */
exports.delArticleById = async function (id) {
    return mysql.update("update cms_article set del_flag='1' where id=?", [id]);
};

/**
 * 分页查询文章所有信息
 */
exports.queryAllArticle = function (cateId,req, currentPage, pagesize) {
    let where = " where ca.category_id=? and ca.del_flag='0' ";
    let order = ' order by ';
    let params = [];

    params.push(cateId);
    if (req.query.title != null && req.query.title != '') {
        where += " and ca.title like '%" + req.query.title + "%'";
    }
    if (req.query.create_date_start != null && req.query.create_date_start != '') {
        where += ' and ca.create_date>=?';
        params.push(req.query.create_date_start);
    }
    if (req.query.create_date_end != null && req.query.create_date_end != '') {
        where += ' and ca.create_date<=?';
        params.push(req.query.create_date_end);
    }
    if (typeof (req.query.sortName) != 'undefined' && typeof (req.query.sortOrder) != 'undefined') {
        order += ' ca.' + req.query.sortName + ' ' + req.query.sortOrder;
    } else {
        order += ' ca.update_date desc';
    }


    return mysql.query(`
        select * from cms_article ca left join cms_article_data cad on ca.id=cad.id
    ` + where
        + order + ' limit ' + (parseInt(currentPage) - 1) * pagesize + ',' + pagesize,
        params);
};

/**
 * 查询文章所有信息的记录数
 */
exports.queryAllArticlePage = async function (cateId,req, pagesize, currentPage) {
    let where = " where ca.category_id=? and ca.del_flag='0' ";
    let params = [];

    params.push(cateId);
    if (req.query.title != null && req.query.title != '') {
        where += " and ca.title like '%" + req.query.title + "%'";
    }
    if (req.query.create_date_start != null && req.query.create_date_start != '') {
        where += ' and ca.create_date>=?';
        params.push(req.query.create_date_start);
    }
    if (req.query.create_date_end != null && req.query.create_date_end != '') {
        where += ' and ca.create_date<=?';
        params.push(req.query.create_date_end);
    }

    let val = await mysql.queryOne('select count(*) as total from cms_article ca ' + where, params);

    return util.makePage(util.getSingleUrl(req), val.total, pagesize, currentPage);
};

/**
 * 插入一条栏目文章信息
 */
exports.saveArticle = function (category_id,title,link,color,image,description, remarks,content,phone_content,longitude,latitude, req) {
    // 取得用户信息
    let user = req.session.user;
    let id = util.uuid();

    return Promise.all([
        mysql.update(`
            insert into cms_article(id,category_id,title,link,color,image,description,create_by,create_date,update_by,update_date,remarks,longitude,latitude,del_flag)
            values(?,?,?,?,?,?,?,?,now(),?,now(),?,?,?,0)
        `,[id,category_id,title,link,color,image,description, user.id, user.id, remarks,longitude,latitude]),
        mysql.update(`
            insert into cms_article_data(id,content,phone_content)
            values(?,?,?)
        `,[id,content,phone_content])
    ]);
};

/**
 * 修改一条栏目文章信息
 */
exports.updateArticle = async function (req) {
    // 需要修改的字符串集
    let sets = '';
    if (req.body.title) {
        sets += ",title='" + req.body.title + "'";
    }
    if (req.body.link) {
        sets += ",link='" + req.body.link + "'";
    }
    if (req.body.color) {
        sets += ",color='" + req.body.color + "'";
    }
    if (req.body.image) {
        sets += ",image='" + req.body.image + "'";
    }
    if (req.body.description) {
        sets += ",description='" + req.body.description + "'";
    }
    if (req.body.remarks) {
        sets += ",remarks='" + req.body.remarks + "'";
    }
    if (req.body.mapLongitude) {
        sets += ",longitude='" + req.body.mapLongitude + "'";
    }
    if (req.body.mapLatitude) {
        sets += ",latitude='" + req.body.mapLatitude + "'";
    }

    let article_data_sets = '';
    if (req.body.content) {
        article_data_sets += ",content='" + req.body.content + "'";
    }
    if (req.body.phone_content) {
        article_data_sets += ",phone_content='" + req.body.phone_content + "'";
    }

    return Promise.all([
        mysql.update(`
            update cms_article set update_date=now() ${sets} where id=${mysql.getMysql().escape(req.body.id)}
        `, null),
        mysql.update(`
            update cms_article_data set id=${mysql.getMysql().escape(req.body.id)} ${article_data_sets} 
            where id=${mysql.getMysql().escape(req.body.id)}
        `, null)
    ]);
};