const config = require('./../../config/index');
var redis = require('redis');
var client = redis.createClient({
    host: config.redis.server,
    port: config.redis.port,
    password: config.redis.password,

});

exports.setObject = function (key, object) {
    // 进入前需要先序列化
    client.set(key, JSON.stringify(object));
};

exports.getObject = function (key) {
    return new Promise((resolve, reject) => {
        client.get(key, function (err, obj) {
            if (err) {
                reject(err);
            }

            // 取出前需要反序列化
            resolve(JSON.parse(obj));
        });
    });

};