const mysql = require('../utils/mysql_db.js');
const util = require('../utils');
const moment = require('moment');
const dictUtil = require('../utils/dict_utils');
const areaDao = require('./area');
const async = require('async');

/**
 * 查询机构信息
 */
exports.queryOffice = function(callback) {
    mysql.query("select so.* from sys_office so where so.del_flag='0'", [ null ], function(err,offices) {
        callback(err, offices);
    });
};

/**
 * 递归查询机构信息
 */
exports.queryOfficeForRecursion = function(callback) {
    mysql.query("select * from sys_office where del_flag='0'", [ null ], function(err,offices) {
        /*jsonToTreeJson(offices,function(err,treeJson){
            callback(err,treeJson);
        });*/
        let treeJson = util.jsonToTreeJson(offices);
        async.map(treeJson,function(row,rowCallback){
            dictUtil.getDictLabel(row.type,'sys_office_type','未知',function(err,label){
                row.office_type_label = label;
            });
            row.create_date = moment(row.create_date).format("YYYY-MM-DD HH:mm:ss");
            areaDao.queryAreaGenealById(row.area_id,function(err,area_labels){
                row.area_labels = area_labels;
                rowCallback(null,row);
            });
            voToBo(row);
        },function(err,result){
            callback(err,treeJson);
        });
    });
};

function voToBo(treeObj){
    dictUtil.getDictLabel(treeObj.type,'sys_office_type','未知',function(err,label){
        treeObj.office_type_label = label;
    });
    treeObj.create_date = moment(treeObj.create_date).format("YYYY-MM-DD HH:mm:ss");
    areaDao.queryAreaGenealById(treeObj.area_id,function(err,area_labels){
        treeObj.area_labels = area_labels;
    });
    if(typeof(treeObj.children)!='undefined'){
        for(let i=0;i<treeObj.children.length;i++){
            voToBo(treeObj.children[i]);
        }
    }
}

/**
 * 把规定的json数据换成treejson数据
 * @param json
 * @returns {Array}
 */
function jsonToTreeJson(json,callback){
    let treeJson = [];
    //先找到第一层后开始递归
    async.map(json,function(row,rowCallback){
        if(row.parent_id=='1'){
            dictUtil.getDictLabel(row.type,'sys_office_type','未知',function(err,label){
                row.office_type_label = label;
            });
            row.create_date = moment(row.create_date).format("YYYY-MM-DD HH:mm:ss");

            areaDao.queryAreaGenealById(row.area_id,function(err,area_labels){
                row.area_labels = area_labels;
                findChildrenByPId(json,row);
                treeJson.push(row);
                rowCallback(null,row);
            });
        }else{
            rowCallback(null,null);
        }
    },function(err,result){
        callback(err,treeJson);
    });
}


function findChildrenByPId(json,obj){
    let children = [];
    for(let i=0;i<json.length;i++){
        if(json[i].parent_id==obj.id){
            dictUtil.getDictLabel(json[i].type,'sys_office_type','未知',function(err,label){
                json[i].office_type_label = label;
            });
            json[i].create_date = moment(json[i].create_date).format("YYYY-MM-DD HH:mm:ss");
            areaDao.queryAreaGenealById(json[i].area_id,function(err,area_labels){
                json[i].area_labels = area_labels;
            });

            findChildrenByPId(json,json[i]);
            children.push(json[i]);
        }
    }
    if(children.length>0){
        obj.children = children;
    }
}
