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
exports.getDictLabel = async function (value, type, defaultValue) {
    let typeDictList = await getDictList(type);
    for (var i = 0; i < typeDictList.length; i++) {
        if (typeDictList[i].value == value) {
            return typeDictList[i].label;
        }
    }
    return defaultValue;
};

exports.getDictList = getDictList;
/**
 * 根据字典类型查询该类型信息
 * @param type
 * @param callback
 */
async function getDictList (type) {

    let dictCache = await cacheUtils.get(CACHE_DICT_MAP);
    let dictsForType = [];
    if (dictCache == null || dictCache.length == 0) {
        let dicts = await mysql.query("select * from sys_dict where del_flag='0' order by sort asc", null);
        cacheUtils.putCache(CACHE_DICT_MAP, dicts);
        for (var i = 0; i < dicts.length; i++) {
            if (dicts[i].type == type) {
                dictsForType.push(dicts[i]);
            }
        }
        return dictsForType;
    } else {

        for (var j = 0; j < dictCache.length; j++) {
            if (dictCache[j].type == type) {
                dictsForType.push(dictCache[j]);
            }
        }

        return dictsForType;
    }
}