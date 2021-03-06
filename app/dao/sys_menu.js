const mysql = require('../utils/mysql_db.js');
const util = require('../utils');

/**
 * 根据菜单ID删除一个菜单
 */
exports.delMenuById = function (id) {
    return mysql.update("update sys_menu set del_flag='1' where id=? or parent_ids like '%" + id + "%'", [id]);
};

/**
 * 根据菜单ID查询菜单信息
 */
exports.queryMenuById = function (id) {
    return mysql.queryOne('select sm.* from sys_menu sm where sm.id = ?', [id]);
};

/**
 * 根据地址查询菜单信息
 */
exports.queryMenuByHref = function (href) {
    return mysql.queryOne("select sm.* from sys_menu sm where sm.href = ? and sm.del_flag='0'", [href]);
};

/**
 * 递归查询菜单信息
 */
exports.queryMenuForRecursion = async function () {
   let menus = await mysql.query("select * from sys_menu where del_flag='0'", [null]);
   return util.jsonToTreeJson(menus);
};

/**
 * 根据菜单id查询菜单家谱信息
 */
exports.queryMenuGenealById = async function (id) {
    let menu = await mysql.queryOne('select * from sys_menu where id =?',[id]);
    // 取得区域信息后切割父亲家谱信息
    let pids = menu.parent_ids.split(',');
    pids.pop();

    let proPids = pids.map(async pid => {
        let p_menu = await mysql.queryOne('select * from sys_menu where id=?', [pid]);

        let parent_label = '';
        if (typeof (p_menu) != 'undefined') {
            parent_label += p_menu.name + '-';
        }
        return parent_label;
    });

    return Promise.all(proPids).then(parent_labels => {
        let parent_labels_str = '';
        for (let i = 0; i < parent_labels.length; i++) {
            parent_labels_str += parent_labels[i];
        }
        parent_labels_str += menu.name;
        return parent_labels_str;
    });
};

/**
 * 非递归查询菜单信息
 */
exports.queryMenus = function () {
    return mysql.query("select * from sys_menu where del_flag='0'", [null]);
};

/**
 * 根据父亲ID查询孩子中最大的sort
 */
exports.querySortMaxByPId = async function (pId) {
    let result = await mysql.queryOne('select max(sort) as sort from sys_menu where parent_id=?', [pId]);
    return result.sort;
};

/**
 * 插入一条菜单信息
 */
exports.saveMenu = async function (parent_id, name, sort, href,icon, permission, remarks, req) {
    // 先根据父亲id查询父亲信息
    let parentMenu = await mysql.queryOne('select * from sys_menu where id=?',[parent_id]);
    // 取得用户信息
    let user = req.session.user;
    let menuId = util.uuid();
    return mysql.update('insert into sys_menu(id,parent_id,parent_ids,name,sort,href,icon,permission,create_by,create_date,update_by,update_date,remarks,del_flag)'
        + ' values(?,?,?,?,?,?,?,?,?,now(),?,now(),?,0)',
        [menuId, parent_id, parentMenu.parent_ids + parentMenu.id + ',', name, sort, href, icon, permission, user.id, user.id, remarks]);
};

/**
 * 修改一条菜单信息
 */
exports.updateMenu = function (req) {
    // 需要修改的字符串集
    let sets = '';
    if (req.body.name) {
        sets += ",name='" + req.body.name + "'";
    }
    if (req.body.password) {
        sets += ',sort=' + req.body.sort ;
    }
    if (req.body.href) {
        sets += ",href='" + req.body.href + "'";
    }
    if (req.body.icon) {
        sets += ",icon='" + req.body.icon + "'";
    }
    if (req.body.permission) {
        sets += ",permission='" + req.body.permission + "'";
    }
    if (req.body.remarks) {
        sets += ",remarks='" + req.body.remarks + "'";
    }

    return mysql.update('update sys_menu set update_date=now() ' + sets + ' where id=' + mysql.getMysql().escape(req.body.id));
};