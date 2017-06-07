const mysql = require('../utils/mysql_db.js');
const util = require('../utils');
const moment = require('moment');
const dictUtil = require('../utils/dict_utils');
const areaDao = require('./sys_area');

/**
 * 根据父类机构ID查询孩子机构最大sort
 */
exports.queryMaxSortByPId = async function (pId) {
    let result = await mysql.queryOne('select max(so.sort) as sort from sys_office so where so.parent_id=?', [pId]);
    return result.sort;
};

/**
 * 根据机构ID查询机构信息
 */
exports.queryOfficeById = function (id) {
    return mysql.queryOne('select so.* from sys_office so where so.id=?', [id]);
};

/**
 * 查询机构信息
 */
exports.queryOffice = function () {
    return mysql.query("select so.* from sys_office so where so.del_flag='0'", [null]);
};

/**
 * 递归查询机构信息
 */
exports.queryOfficeForRecursion = async function () {
    let offices = await mysql.query("select * from sys_office where del_flag='0'", [null]);
    let treeJson = util.jsonToTreeJson(offices,'0');
    let proTree = treeJson.map(row => {
        return Promise.all([
            dictUtil.getDictLabel(row.type, 'sys_office_type', '未知'),
            //areaDao.queryAreaGenealById(row.area_id)
        ]).then(async result => {
            row.office_type_label = result[0];
            row.create_date = moment(row.create_date).format('YYYY-MM-DD HH:mm:ss');
            await voToBo(row);
            return row;
        });
    });

    return Promise.all(proTree);
};

/**
 * 将vo转为bo
 * @param treeObj
 * @param callback
 */
function voToBo (treeObj) {
    return Promise.all([
        dictUtil.getDictLabel(treeObj.type, 'sys_office_type', '未知'),
        areaDao.queryAreaGenealById(treeObj.area_id)
    ]).then(async result => {
        treeObj.office_type_label = result[0];
        treeObj.area_labels = result[1];
        treeObj.create_date = moment(treeObj.create_date).format('YYYY-MM-DD HH:mm:ss');

        if (typeof (treeObj.children) != 'undefined') {
            let proTreeObj = treeObj.children.map(async row => {
                row = await voToBo(row);
                return row;
            });
            return Promise.all(proTreeObj);
        } else {
            return treeObj;
        }
    });
}

/**
 * 根据机构ID删除一个机构
 */
exports.delOfficeById = function (id) {
    return mysql.update("update sys_office set del_flag='1' where id=? or parent_ids like '%" + id + "%'", [id]);
};

/**
 * 插入一条机构信息
 */
exports.saveOffice = async function (parent_id, name, sort, area_id,code, type,address,master,phone,fax,email, remarks, req) {
    // 先根据父亲id查询父亲信息
    let parentOffice = await mysql.queryOne('select * from sys_office where id=?',[parent_id]);
    // 如果不存在说明是根目录
    if (parentOffice == null || typeof(parentOffice) == 'undefined'){
        parentOffice = {
            parent_ids:'',
            id:'0'
        };
    }

    // 取得用户信息
    let user = req.session.user;
    let officeId = util.uuid();
    return mysql.update('insert into sys_office(id,parent_id,parent_ids,name,sort,area_id,code,type,address,master,phone,fax,email,create_by,create_date,update_by,update_date,remarks,del_flag)'
        + ' values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,now(),?,now(),?,0)',
        [officeId, parent_id, parentOffice.parent_ids + parentOffice.id + ',', name, sort, area_id, code, type,address,master,phone,fax,email,user.id, user.id, remarks]);
};

/**
 * 修改一条机构信息
 */
exports.updateOffice = function (req) {
    // 需要修改的字符串集
    let sets = '';
    if (req.body.name) {
        sets += ",name='" + req.body.name + "'";
    }
    if (req.body.area_id) {
        sets += ",area_id='" + req.body.area_id + "'";
    }
    if (req.body.code) {
        sets += ",code='" + req.body.code + "'";
    }
    if (req.body.type) {
        sets += ",type='" + req.body.type + "'";
    }
    if (req.body.address) {
        sets += ",address='" + req.body.address + "'";
    }
    if (req.body.master) {
        sets += ",master='" + req.body.master + "'";
    }
    if (req.body.phone) {
        sets += ",phone='" + req.body.phone + "'";
    }
    if (req.body.fax) {
        sets += ",fax='" + req.body.fax + "'";
    }
    if (req.body.email) {
        sets += ",email='" + req.body.email + "'";
    }
    if (req.body.remarks) {
        sets += ",remarks='" + req.body.remarks + "'";
    }

    return mysql.update('update sys_office set update_date=now() ' + sets + ' where id=?', [req.body.id]);
};