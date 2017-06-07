const mysql = require('../utils/mysql_db.js');
const util = require('../utils');

/**
 * 根据栏目分类ID查询栏目信息
 */
exports.queryCateById = function (id) {
    return mysql.queryOne('select * from cms_category where id=?', [id]);
};

/**
 * 根据栏目分类ID和站点ID查询
 */
exports.queryMaxSortByCateIdAndSiteId = async function (pId,siteId) {
    let result = await mysql.queryOne('select max(sort) as sort from cms_category where parent_id=? and site_id=?', [pId,siteId]);
    return result.sort;
};

/**
 * 根据栏目分类ID删除一个栏目分类信息
 */
exports.delCateById = function (id) {
    return mysql.update(`
    update cms_category set del_flag='1' where id=? or parent_ids like '%${id}%'
`, [id]);
};

/**
 * 递归查询菜单信息
 */
exports.queryCmsCateForRecursion = async function (siteId) {
   let cates = await mysql.query("select * from cms_category where del_flag='0' and site_id=?", [siteId]);
   return util.jsonToTreeJson(cates,'0');
};

/**
 * 插入一条栏目分类信息
 */
exports.saveCate = async function (parent_id, site_id,module,name,image,href,target,description,sort,remarks, req) {
    // 取得用户信息
    let user = req.session.user;
    let id = util.uuid();

    // 根据父亲ID查询父亲栏目信息
    let parentCate = await mysql.queryOne('select * from cms_category where id =? ',[parent_id]);
    if (!parentCate){
        parentCate = {
            id:0,
            parent_ids:''
        };
    }

    return mysql.update(
    `insert into cms_category(id,parent_id,parent_ids,site_id,office_id,module,name,image,href,target,description,sort,create_by,create_date,update_by,update_date,remarks,del_flag)
    values (?,?,?,?,?,?,?,?,?,?,?,?,?,now(),?,now(),?,'0')`,
    [id, parent_id, parentCate.parent_ids + parentCate.id + ',', site_id, user.office_id, module,name,image,href,target,description,sort,user.id,user.id, remarks]);
};

/**
 * 修改一条栏目分类信息
 */
exports.updateCate = function (req) {
    // 需要修改的字符串集
    let sets = '';
    if (req.body.parent_id) {
        sets += ",parent_id='" + req.body.parent_id + "'";
    }
    if (req.body.site_id) {
        sets += ",site_id='" + req.body.site_id + "'";
    }
    if (req.body.module) {
        sets += ",module='" + req.body.module + "'";
    }
    if (req.body.name) {
        sets += ",name='" + req.body.name + "'";
    }
    if (req.body.image) {
        sets += ",image='" + req.body.image + "'";
    }
    if (req.body.href) {
        sets += ",href='" + req.body.href + "'";
    }
    if (req.body.target) {
        sets += ",target='" + req.body.target + "'";
    }
    if (req.body.description) {
        sets += ",description='" + req.body.description + "'";
    }
    if (req.body.keywords) {
        sets += ",keywords='" + req.body.keywords + "'";
    }
    if (req.body.sort) {
        sets += ',sort=' + req.body.sort;
    }
    if (req.body.remarks) {
        sets += ",remarks='" + req.body.remarks + "'";
    }

    return mysql.update('update cms_category set update_date=now() ' + sets + ' where id=' + mysql.getMysql().escape(req.body.id));
};

/**
 * 根据站点ID查询该站点下的所有有效的栏目分类信息
 */
exports.queryCateBySiteId = function (siteId) {
    return mysql.query(`
        select * from cms_category where site_id=? and del_flag='0' order by create_date desc
    `,siteId);
};