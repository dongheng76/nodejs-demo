'use strict';

const area = require('../../controllers/manage/area');

/**
 * 面板路由
 **/
module.exports = function (app, passport) {
    app.get('/manage/area', area.index);
    app.post('/manage/area/findareabypid', area.findareabypid);
    app.get('/manage/area/create', area.create);
    app.post('/manage/area/store', area.store);
    app.get('/manage/area/edit', area.edit);
    app.post('/manage/area/delete', area.delete);
};