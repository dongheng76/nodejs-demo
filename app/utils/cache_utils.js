const client = require('./redis_utils');
var SYS_CACHE = "sysCache";

//取得系统缓存
exports.getSysCache = getSysCache;

function getSysCache(callback){
    client.getObject(SYS_CACHE,function(err,obj){
        if(obj==null){
            var sysCache = {
                dicts:[],
                areas:[]
            };

            client.setObject(SYS_CACHE,sysCache);
            callback(err,sysCache);
        }else{
            callback(err,obj);
        }
    });
}

//取得某缓存的对象
exports.get = function(cacheName,callback){
    getSysCache(function(err,obj){
        callback(err,obj[cacheName]);
    });
}

//写入缓存
exports.putCache = function(cacheName,object){
    getSysCache(function(err,obj){
        obj[cacheName] = object;
        client.setObject(SYS_CACHE,obj);
    })
}

//写入缓存的键值
exports.put = function(cacheName,key,value){
    getSysCache(function(err,obj){
        obj[cacheName][key] = value;
        client.setObject(SYS_CACHE,obj);
    })
}

//从缓存删除所有数据
exports.removeAll = function(cacheName){
    getSysCache(function(err,obj){
        obj[cacheName] = null;
        client.setObject(SYS_CACHE,obj);
    })
}

//从缓存中移除一个key的值
exports.remove = function(cacheName,key){
    getSysCache(function(err,obj){
        obj[cacheName][key] = null;
        client.setObject(SYS_CACHE,obj);
    })
}

