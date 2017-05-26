const mysql = require('../utils/mysql_db.js');
const util = require('../utils');
const async = require('async');

/**
 * 根据区域父亲ID查询孩子信息
 */
exports.queryAreasByPId = function (pid, callback) {
    mysql.query("select sa.*,sa.type as level,true as isParent from sys_area sa where sa.del_flag='0' and sa.parent_id =?",
        [pid], function (err, areas) {
            callback(err, areas);
        });
};

/**
 * 根据区域id查询区域信息
 */
exports.queryAreaById = function (id, callback) {
    mysql.queryOne("select * from sys_area where del_flag='0' and id =? order by sort asc",
        [id], function (err, areas) {
            callback(err, areas);
        });
};

/**
 * 根据区域id查询该区域下孩子的最大sort值
 */
exports.queryChildrenMaxSort = function (pid, callback) {
    mysql.queryOne("select max(sa.sort) as max_sort from sys_area sa where sa.del_flag='0' and sa.parent_id =?",
        [pid], function (err, result) {
            callback(err, result.max_sort);
        });
};

/**
 * 插入一条区域信息
 */
exports.saveArea = function (parent_id, name, sort, code, type, remarks, req, callback) {
    // 取得用户信息
    let user = req.session.user;
    let id = util.uuid();
    // 首先根据父亲ID查询父亲信息
    mysql.queryOne("select * from sys_area where id=?", [parent_id], function (err, area) {
        if (err || !area) {
            callback(err, false);
        } else {
            mysql.update("insert into sys_area(id,parent_id,parent_ids,name,sort,code,type,create_by,create_date,update_by,update_date,remarks,del_flag)"
                + "values(?,?,?,?,?,?,?,?,now(),?,now(),?,0)",
                [id, parent_id, area.parent_ids + parent_id + ',', name, sort, code, type, user.id, user.id, remarks], function (err, result) {
                    callback(err, result);
                });
        }
    });
};

/**
 * 修改一条用户信息
 */
exports.updateArea = function (req, callback) {
    //需要修改的字符串集
    let sets = '';
    if (req.body.name) {
        sets += ",name='" + req.body.name + "'";
    }
    if (req.body.sort) {
        sets += ",sort='" + req.body.sort + "'";
    }
    if (req.body.code) {
        sets += ",code='" + req.body.code + "'";
    }
    if (req.body.type) {
        sets += ",type='" + req.body.type + "'";
    }
    if (req.body.remarks) {
        sets += ",remarks='" + req.body.remarks + "'";
    }
    mysql.update("update sys_area set update_date=now() " + sets + " where id=?", [req.body.id], function (err, result) {
        callback(err, result);
    });
};

/**
 * 根据区域ID删除一个区域信息
 */
exports.delAreaById = function (id, callback) {
    mysql.update("update sys_area set del_flag='1' where parent_ids like '%" + id + "%' or id=?", [id], function (err, result) {
        callback(err, result);
    });
};

/**
 * 根据区域id查询区域家谱信息
 */
exports.queryAreaGenealById = function (id, callback) {
    mysql.queryOne("select * from sys_area where id =?",
        [id], function (err, area) {
            //取得区域信息后切割父亲家谱信息
            let pids = area.parent_ids.split(',');
            pids.pop();

            async.map(pids, function (pid, pidsCallback) {
                mysql.queryOne("select * from sys_area where id=?", [pid], function (err, p_area) {
                    let parent_label = '';
                    if (typeof (p_area) != 'undefined') {
                        parent_label += p_area.name + ',';
                    }
                    pidsCallback(null, parent_label);
                });
            }, function (err, parent_labels) {
                let parent_labels_str = '';
                for (let i = 0; i < parent_labels.length; i++) {
                    parent_labels_str += parent_labels[i];
                }
                parent_labels_str += area.name;

                callback(err, parent_labels_str);
            });
        });
};