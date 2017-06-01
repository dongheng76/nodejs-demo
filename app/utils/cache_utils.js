const client = require('./redis_utils');
var SYS_CACHE = "sysCache";

// 取得系统缓存
exports.getSysCache = getSysCache;

function getSysCache () {
    return client.getObject(SYS_CACHE);
}

// 取得某缓存的对象
exports.get = function (cacheName) {
    let sysCache = getSysCache();
    return sysCache[cacheName];
};

// 写入缓存
exports.putCache = async function (cacheName, object) {
    let sysCache = await getSysCache();
    sysCache[cacheName] = object;
    client.setObject(SYS_CACHE, sysCache);
};

// 写入缓存的键值
exports.put = function (cacheName, key, value) {
    let sysCache = getSysCache();
    sysCache[cacheName][key] = value;
    client.setObject(SYS_CACHE, sysCache);
};

// 从缓存删除所有数据
exports.removeAll = function (cacheName) {
    let sysCache = getSysCache();
    sysCache[cacheName] = null;
    client.setObject(SYS_CACHE, sysCache);
};

// 从缓存中移除一个key的值
exports.remove = function (cacheName, key) {
    let sysCache = getSysCache();
    sysCache[cacheName][key] = null;
    client.setObject(SYS_CACHE, sysCache);
};

