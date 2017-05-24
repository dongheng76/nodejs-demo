const config = require('./../../config/index');
var redis = require('redis');
var client = redis.createClient({
    host: config.redis.server,
    port: config.redis.port,
    password : config.redis.password,

});

exports.setObject = function (key, object) {
    // 进入前需要先序列化
    client.set(key, JSON.stringify(object)); 
};

exports.getObject = function (key, callback) {
    client.get(key, function (err, obj) {
        // 取出前需要反序列化
        callback(err, JSON.parse(obj));
    });
};