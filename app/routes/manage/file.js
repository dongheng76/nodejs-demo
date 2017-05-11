'use strict';

const file = require('../../controllers/manage/file');

/**
 * 文件路由
 **/
module.exports = function (app, passport) {
    app.get('/manage/file', file.index);
    app.get('/manage/file/create', file.create);
    //上传文件
    app.post('/manage/file/upload', file.upload);
    app.post('/manage/file/delfilecate', file.delfilecate);
    app.post('/manage/file/show', file.show);
    app.get('/manage/file/getfolders', file.getfolders);
    app.get('/manage/file/getfiles', file.getfiles);
    app.get('/manage/file/mkdir', file.mkdir);
};