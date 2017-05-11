'use strict';

const user = require('../../controllers/manage/user');

/**
 * 登录路由
 **/
module.exports = function (app, passport) {
    app.get('/manage/user', user.index);
    app.get('/manage/user/create', user.create);
    app.post('/manage/user/store', user.store);
    app.post('/manage/user/delete', user.delete);
    app.post('/manage/user/show', user.show);
};