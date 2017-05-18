'use strict';

const office = require('../../controllers/manage/office');

/**
 * 面板路由
 **/
module.exports = function (app, passport) {
    app.get('/manage/office', office.index);
    app.get('/manage/office/create', office.create);
    app.post('/manage/office/store', office.store);
    app.get('/manage/office/edit', office.edit);
    app.post('/manage/office/delete', office.delete);
};