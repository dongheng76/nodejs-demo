'use strict';

const panel = require('../../controllers/manage/panel');

/**
 * 面板路由
 **/
module.exports = function (app, passport) {
    app.get('/manage/panel', panel.index);
};