'use strict';

const role = require('../../controllers/manage/role');

/**
 * 面板路由
 **/
module.exports = function (app, passport) {
    app.get('/manage/role', role.index);
    app.get('/manage/role/create', role.create);
    app.post('/manage/role/store', role.store);
    app.get('/manage/role/edit', role.edit);
    app.post('/manage/role/delete', role.delete);
};