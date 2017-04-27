var db    = {};
const mysql = require('mysql');
var pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    port            : '3306',
    user            : 'root',
    password        : '',
    database        : 'homestead'
});

db.query = function(sql,params,callback){

    if (!sql) {
        callback();
        return;
    }
    pool.query(sql,params, function(err, rows, fields) {
        if (err) {
            console.log(err);
            callback(err, null);
            return;
        };

        callback(null, rows, fields);
    });
}
module.exports = db;