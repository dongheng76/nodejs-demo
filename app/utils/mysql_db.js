/**
 * 封装mysql pool和基本操作
 */

var util = require('util');
var genericPool = require('generic-pool');
var dbDriver = require('mysql');
var config = require("./../../config/index");
var log = require('./log.js');

console.log("init pool start..");

/**
 * Step 1 - Create pool using a factory object
 */
const factory = {
    create: function(){
        return new Promise(function(resolve, reject) {
            var client = dbDriver.createConnection({
                host: config.server,
                user: config.user,
                password: config.password,
                database: config.database
            });
            client.connect(function (err) {
                if (err) {
                    console.log('Database connection error');
                } else {
                    resolve(client);
                    console.log('Database connection successful');
                }
            });
        }).catch(function(error){
            console.log(error);
        });
    },
    destroy:function(client){
        return new Promise(function(resolve){
            client.on('end', function(){
                resolve()
            })
            client.disconnect()
        }).catch(function(error){
            console.log(error);
        });
    }
}

var opts = {
    max: 100, // maximum size of the pool
    min: 1 // minimum size of the pool
}

var pool = genericPool.createPool(factory, opts);
var resourcePromise = pool.acquire();



console.log("init pool end....");

// 封装的基本mysql操作
/**
 * 查询所有记录
 */
exports.query = function(sql, data, callback) {
    if (util.isArray(data)) {
        resourcePromise.then(function(client) {
            client.query(sql, data, function(err,rows) {
                // return object back to pool
                pool.release(client);
                if(err){
                    log.error(err);
                    callback(err, null);
                    return;
                }
                callback(err, rows);// 必须有callback
            });
        })
        .catch(function(err){
            callback(err);
            return;
        });
    }
    else {
        resourcePromise.then(function(client) {
            client.query(sql, function(err,rows) {
                // return object back to pool
                pool.release(client);
                if(err){
                    log.error(err);
                    callback(err, null);
                    return;
                }
                callback(err, rows);// 必须有callback
            });
        })
        .catch(function(err){
            callback(err);
            return;
        });
    }
    pool.drain().then(function() {
        pool.clear();
    });
};

/**
 * 查询记录，但只返回一条
 */
exports.queryOne = function(sql, data, callback) {
    if (util.isArray(data)) {
        resourcePromise.then(function(client) {
            client.query(sql, data, function(err,rows) {
                pool.release(client);
                if(err){
                    log.error(err);
                    callback(err, null);
                    return;
                }
                callback(err, rows[0]);// 必须有callback
            });
        })
        .catch(function(err){
            // handle error - this is generally a timeout or maxWaitingClients
            // error
            callback(err);
            return;
        });
    }
    else {
        resourcePromise.then(function(client) {
            client.query(sql, function(err,rows) {
                // return object back to pool
                pool.release(client);
                if(err){
                    log.error(err);
                    callback(err, null);
                    return;
                }
                callback(err, rows[0]);// 必须有callback
            });
        })
        .catch(function(err){
            callback(err);
            return;
        });
    }
    pool.drain().then(function() {
        pool.clear();
    });
};

/**
 * update或delete数据
 */
exports.update = function(sql, data, callback) {
    if (util.isArray(data)) {
        resourcePromise.then(function(client) {
            client.query(sql, data, function(err,rows) {
                // return object back to pool
                pool.release(client);
                if(err){
                    log.error(err);
                    callback(err, null);
                    return;
                }
                callback(err, rows);// 必须有callback
            });
        })
        .catch(function(err){
            callback(err);
            return;
        });
    }
    else {
        resourcePromise.then(function(client) {
            client.query(sql, function(err,rows) {
                // return object back to pool
                pool.release(client);
                if(err){
                    log.error(err);
                    callback(err, null);
                    return;
                }
                callback(err, rows);// 必须有callback
            });
        })
        .catch(function(err){
            callback(err);
            return;
        });
    }
    pool.drain().then(function() {
        pool.clear();
    });
};