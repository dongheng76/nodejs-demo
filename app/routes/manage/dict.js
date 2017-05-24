'use strict';

const dict = require('../../controllers/manage/dict');

/**
 * 面板路由
 **/
module.exports = function (app, passport) {
    app.get('/manage/dict', dict.index);
    app.get('/manage/dict/create', dict.create);
    app.post('/manage/dict/store', dict.store);
    app.get('/manage/dict/edit', dict.edit);
    app.post('/manage/dict/delete', dict.delete);
};