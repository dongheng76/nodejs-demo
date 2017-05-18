'use strict';

const menu = require('../../controllers/manage/menu');

/**
 * 面板路由
 **/
module.exports = function (app, passport) {
    app.get('/manage/menu', menu.index);
    app.get('/manage/menu/create', menu.create);
    app.post('/manage/menu/store', menu.store);
    app.get('/manage/menu/edit', menu.edit);
    app.post('/manage/menu/delete', menu.delete);
};