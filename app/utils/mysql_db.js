/**
 * 封装mysql pool和基本操作
 */

const util = require('util');
const mysql = require('mysql');
const config = require('./../../config/index');
const log = require('./log.js').logger;
const async = require('async');

log.info('init pool start..');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: config.mysql.server,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database
});

log.info('init pool end....');

// 封装的基本mysql操作
/**
 * 把需要的mysql返回出来使用
 */
exports.getMysql = function () {
    return mysql;
};

let getConnection = function () {
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, conn) {
            if (err) {
                reject(err);
            }
            resolve(conn);
        });
    });
};


/**
 * 查询所有记录
 */
exports.query = async function (sql, data) {
    let conn = await getConnection();
    if (util.isArray(data)) {
        return new Promise(function (resolve, reject) {
            conn.query(sql, data, function (err, rows) {
                // return object back to pool
                conn.release();
                if (err) {
                    log.error(err);
                    reject(err);
                }
                resolve(rows);
            });
        }).catch(function (error) {
            console.log(error);
        });
    }
    else {
        return new Promise(function (resolve, reject) {
            conn.query(sql, function (err, rows) {
                // return object back to pool
                conn.release();
                if (err) {
                    log.error(err);
                    reject(err);
                }
                resolve(rows);// 必须有callback
            });
        }).catch(function (error) {
            log.error(error);
        });
    }
};

/**
 * 查询记录，但只返回一条
 */
exports.queryOne = async function (sql, data) {
    let conn = await getConnection();
    if (util.isArray(data)) {
        return new Promise(function (resolve, reject) {
            conn.query(sql, data, function (err, rows) {
                conn.release();
                if (err) {
                    log.error(err);
                    reject(err);
                }
                resolve(rows[0]);// 必须有callback
            });
        }).catch(function (error) {
            log.error(error);
        });
    }
    else {
        return new Promise(function (resolve, reject) {
            conn.query(sql, function (err, rows) {
                // return object back to pool
                conn.release();
                if (err) {
                    log.error(err);
                    reject(err);
                }
                resolve(rows[0]);// 必须有callback
            });
        }).catch(function (error) {
            console.log(error);
        });
    }
};

/**
 * update或delete数据
 */
exports.update = async function (sql, data) {
    let conn = await getConnection();
    if (util.isArray(data)) {
        return new Promise(function (resolve, reject) {
            conn.query(sql, data, function (err, result) {
                // return object back to pool
                conn.release();
                if (err) {
                    log.error(err);
                    reject(err);
                }
                console.log(result);
                resolve(result);// 必须有callback
            });
        }).catch(function (error) {
            log.error(error);
        });
    }
    else {
        return new Promise(function (resolve, reject) {
            conn.query(sql, function (err, result) {
                // return object back to pool
                conn.release();
                if (err) {
                    log.error(err);
                    reject(err);
                }
                resolve(result);// 必须有callback
            });
        }).catch(function (error) {
            log.error(error);
        });
    }
};