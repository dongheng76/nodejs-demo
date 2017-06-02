/**
 * 封装mysql pool和基本操作
 */

const util = require('util');
const mysql = require('mysql');
const config = require('./../../config/index');
const console = require('log4js').getLogger('mysql');
console.info('init pool start..'); 
const pool = mysql.createPool({
    connectionLimit: 10,
    host: config.mysql.server,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database
});
console.info('init pool end....');

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

exports.beginTransaction = async function () {
    let connection = await getConnection();
    return new Promise((resolve, reject) => {
        connection.beginTransaction(function (err) {
            if (err) {
                console.error(err);
                reject(err);
            }
            resolve(connection);
        });
    });
};

exports.commitTransaction = function (connection) {
    return new Promise((resolve, reject) => {
        connection.commit((err) => {
            try {
                if (err) {
                    reject(err);
                }
                resolve();
            } catch (e) {
                console.error(e);
                reject(e);
            } finally {
                try {
                    connection.release();
                } catch (e) {
                    console.error(e);
                }
            }
        });
    });
};

exports.rollbackTransaction = function (connection) {
    return new Promise((resolve, reject) => {
        try {
            connection.rollback(() => {
                resolve();
            });
        } catch (e) {
            console.error(e);
            reject(e);
        } finally {
            try {
                connection.release();
            } catch (e) {
                console.error(e);
            }
        }
    });
};


/**
 * 查询所有记录
 */
exports.query = async function (sql, param, connection) {
    let conn = null;
    if (connection) {
        conn = connection;
    }
    if (!conn) {
        conn = await getConnection();
    }
    return new Promise(function (resolve, reject) {
        conn.query(sql, param || [], function (err, rows) {
            // return object back to pool
            try {
                if (!connection) {
                    conn.release();
                }
            } catch (e) {
                console.error(e);
                reject(e);
            }
            if (err) {
                console.error(err);
                reject(err);
            }
            resolve(rows);
        });
    });
};

/**
 * 查询记录，但只返回一条
 */
exports.queryOne = async function (sql, param, connection) {
    let conn = null;
    if (connection) {
        conn = connection;
    }
    if (!conn) {
        conn = await getConnection();
    }
    return new Promise(function (resolve, reject) {
        conn.query(sql, param || [], function (err, rows) {
            try {
                if (!connection) {
                    conn.release();
                }
            } catch (e) {
                console.error(e);
                reject(e);
            }
            if (err) {
                console.error(err);
                reject(err);
            }
            resolve(rows[0]); // 必须有callback
        });
    });
};

/**
 * update或delete数据
 */
exports.update = async function (sql, param, connection) {
    let conn = null;
    if (connection) {
        conn = connection;
    }
    if (!conn) {
        conn = await getConnection();
    }
    return new Promise(function (resolve, reject) {
        conn.query(sql, param || [], function (err, result) {
            // return object back to pool
            try {
                if (!connection) {
                    conn.release();
                }
            } catch (e) {
                console.error(e);
                reject(e);
            }
            if (err) {
                console.error(err);
                reject(err);
            }
            resolve(result); // 必须有callback
        });
    });

};