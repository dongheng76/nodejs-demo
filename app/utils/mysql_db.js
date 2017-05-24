/**
 * 封装mysql pool和基本操作
 */

const util = require('util');
const mysql = require('mysql');
const config = require("./../../config/index");
const log = require('./log.js');

console.log("init pool start..");

const pool = mysql.createPool({
    connectionLimit: 10,
    host: config.server,
    user: config.user,
    password: config.password,
    database: config.database
});

console.log("init pool end....");

// 封装的基本mysql操作
/**
 * 查询所有记录
 */
exports.query = function (sql, data, callback) {
    pool.getConnection(function (err, conn) {
        if (util.isArray(data)) {
            conn.query(sql, data, function (err, rows) {
                // return object back to pool
                conn.release();
                if (err) {
                    log.error(err);
                    callback(err, null);
                    return;
                }
                callback(err, rows);// 必须有callback
            });
        }
        else {
            conn.query(sql, function (err, rows) {
                // return object back to pool
                conn.release();
                if (err) {
                    log.error(err);
                    callback(err, null);
                    return;
                }
                callback(err, rows);// 必须有callback
            });
        }
    });
};

/**
 * 查询记录，但只返回一条
 */
exports.queryOne = function (sql, data, callback) {
    pool.getConnection(function (err, conn) {
        if (util.isArray(data)) {
            conn.query(sql, data, function (err, rows) {
                conn.release();
                if (err) {
                    log.error(err);
                    callback(err, null);
                    return;
                }
                callback(err, rows[0]);// 必须有callback
            });
        }
        else {
            conn.query(sql, function (err, rows) {
                // return object back to pool
                conn.release();
                if (err) {
                    log.error(err);
                    callback(err, null);
                    return;
                }
                callback(err, rows[0]);// 必须有callback
            });
        }
    });
};

/**
 * update或delete数据
 */
exports.update = function (sql, data, callback) {
    pool.getConnection(function (err, conn) {
        if (util.isArray(data)) {
            conn.query(sql, data, function (err, rows) {
                // return object back to pool
                conn.release();
                if (err) {
                    log.error(err);
                    callback(err, null);
                    return;
                }
                callback(err, rows);// 必须有callback
            });
        }
        else {
            conn.query(sql, function (err, rows) {
                // return object back to pool
                conn.release();
                if (err) {
                    log.error(err);
                    callback(err, null);
                    return;
                }
                callback(err, rows);// 必须有callback
            });
        }
    });
};