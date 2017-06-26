const mysql = require('../utils/mysql_db.js');
const util = require('../utils');

/**
 * 根据站点ID查询站点信息
 */
exports.querySiteById = function (id) {
    return mysql.queryOne('select * from cms_site where id=?', [id]);
};

/**
 * 查询我自己机构的当前站点ID
 */
exports.queryMyOfficeCurSite = function (id) {
    return mysql.queryOne("select co.*,cs.* from cms_office_site co left join cms_site cs on co.site_id=cs.id  where co.office_id=? and co.is_current='1'", [id]);
};

/**
 * 切换站点在选择的站点上去
 */
exports.changeCurrentSite = async function (site_id,office_id) {
    // 查看机构的这个站点是否存在
    let result = await mysql.queryOne(`
        select count(*) as count from cms_office_site where site_id=? and office_id=?
    `,[site_id,office_id]);

    // 如果存在直接修改
    if (result && result.count > 0){
        return Promise.all(mysql.update(`
            update cms_office_site set is_current='1' where site_id=? and office_id=?
        `,[site_id,office_id]),
        mysql.update(`
            update cms_office_site set is_current='0' where site_id!=? and office_id=?
        `,[site_id,office_id]));
    }
    // 如果不存在直接插入新的
    else {
        return mysql.update(`
            insert into cms_office_site(site_id,office_id,is_current) values(?,?,'1')
        `,[site_id,office_id]);
    }
};

/**
 * 根据站点ID删除一个字典信息
 */
exports.delSiteById = function (id) {
    return mysql.update("update cms_site set del_flag='1' where id=?", [id]);
};

/**
 * 分页查询站点所有信息
 */
exports.queryAllSite = function (req, currentPage, pagesize) {
    let where = "where cs.del_flag='0' ";
    let params = [];
    let user = req.session.user;

    // 如果是管理员可以查询所有
    // 如果是普通用户只能查询自己的网站
    if (user.id != '1'){
        where += ' and cs.create_by=?';
        params.push(user.id);
    }
    if (req.query.name != null && req.query.name != '') {
        where += ' and cs.name=?';
        params.push(req.query.name);
    }

    return mysql.query('select cs.* from cms_site cs ' + where + ' order by cs.update_date desc limit ' + (parseInt(currentPage) - 1) * pagesize + ',' + pagesize,params);
};

/**
 * 查询站点所有信息的记录数
 */
exports.queryAllSitePage = async function (req, pagesize, currentPage) {
    let where = "where cs.del_flag='0' ";
    let params = [];
    let user = req.session.user;

    // 如果是管理员可以查询所有
    // 如果是普通用户只能查询自己的网站
    if (user.id != '1'){
        where += ' and cs.create_by=?';
        params.push(user.id);
    }

    if (req.query.name != null && req.query.name != '') {
        where += ' and cs.name=?';
        params.push(req.query.name);
    }
    
    let val = await mysql.queryOne('select count(*) as total from cms_site cs ' + where, params);
    return util.makePage(util.getSingleUrl(req), val.total, pagesize, currentPage);
};

/**
 * 插入一条字典信息
 */
exports.saveSite = function (name, title, logo,domain,description,keywords,copyright, remarks,domain_name, req) {
    // 取得用户信息
    let user = req.session.user;
    let id = util.uuid();
    return mysql.update(
    `insert into cms_site(id,name,title,logo,domain,description,keywords,copyright,create_by,create_date,update_by,update_date,remarks,del_flag,domain_name)
    values (?,?,?,?,?,?,?,?,?,now(),?,now(),?,'0',?)`,
    [id, name, title, logo, domain, description,keywords,copyright, user.id,user.id, remarks,domain_name]);
};

/**
 * 修改一条字典信息
 */
exports.updateSite = function (req) {
    // 需要修改的字符串集
    let sets = '';
    if (req.body.name) {
        sets += ",name='" + req.body.name + "'";
    }
    if (req.body.title) {
        sets += ",title='" + req.body.title + "'";
    }
    if (req.body.logo) {
        sets += ",logo='" + req.body.logo + "'";
    }
    if (req.body.domain) {
        sets += ",domain='" + req.body.domain + "'";
    }
    if (req.body.description) {
        sets += ",description='" + req.body.description + "'";
    }
    if (req.body.keywords) {
        sets += ",keywords='" + req.body.keywords + "'";
    }
    if (req.body.copyright) {
        sets += ",copyright='" + req.body.copyright + "'";
    }
    if (req.body.remarks) {
        sets += ",remarks='" + req.body.remarks + "'";
    }
    if (req.body.domain_name) {
        sets += ",domain_name='" + req.body.domain_name + "'";
    }

    return mysql.update('update cms_site set update_date=now() ' + sets + ' where id=?', [req.body.id]);
};
