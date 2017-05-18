'use strict';

const login = require('../../controllers/manage/login');

/**
* 登录路由
**/
module.exports = function (app, passport) {
    app.get('/manage/login', login.login);
    app.post('/manage/signin', login.signin);
    app.post('/manage/signup', login.signup);
    app.get('/manage/logout', login.logout);
};