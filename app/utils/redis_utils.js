var redis = require("redis");
var client = redis.createClient({
    host:'127.0.0.1',
    port:6379
});

exports.setObject = function(key,object){
    //进入前需要先序列化
    client.set(key,JSON.stringify(object));
}

exports.getObject = function(key,callback){
    client.get(key, function (err, obj) {
        //取出前需要反序列化
        callback(err, JSON.parse(obj));
    });
}