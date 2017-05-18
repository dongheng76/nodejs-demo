const CACHE_DICT_MAP = "dicts";
const cacheUtils = require('./cache_utils');
const mysql = require('./mysql_db.js');

/**
 * 根据字典类型和字典值查询label信息
 * @param value
 * @param type
 * @param defaultValue
 * @param callback
 */
exports.getDictLabel = function(value,type,defaultValue,callback){
    getDictList(type,function(err,obj){
        for(var i=0;i<obj.length;i++){
            if(obj[i].value == value){
                callback(err,obj[i].label);
                return;
            }
        }
        callback(err,defaultValue);
    });
}

exports.getDictList = getDictList;
/**
 * 根据字典类型查询该类型信息
 * @param type
 * @param callback
 */
function getDictList(type,callback){

    cacheUtils.get(CACHE_DICT_MAP,function(err,obj){
        if(obj==null || obj.length==0){
            mysql.query("select * from sys_dict where del_flag='0' order by sort asc",null, function(err, dicts) {
                cacheUtils.putCache(CACHE_DICT_MAP,dicts);
                var dictsForType = [];
                for(var i=0;i<dicts.length;i++){
                    if(dicts[i].type==type){
                        dictsForType.push(dicts[i]);
                    }
                }
                callback(err,dictsForType);
            });
        }else{
            var dictsForType = [];

            for(var i=0;i<obj.length;i++){
                if(obj[i].type==type){
                    dictsForType.push(obj[i]);
                }
            }

            callback(null,dictsForType);
        }
    });
}