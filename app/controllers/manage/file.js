'use strict';

/**
 * Module dependencies.
 */

const async = require('async');
// const utils = require('../../utils');
// const validator = require('validator');
const menuDao = require('../../dao/menu');
const fileDao = require('../../dao/file');
const util = require('../../utils');
const dictUtil = require('../../utils/dict_utils');
// const moment = require('moment');
const uuidV1 = require('uuid/v1');
const path = require('path');
// 文件读写操作
const fs = require('fs');
const sizeOf = require('image-size');
const gm = require('gm').subClass({
    imageMagick: true
});

module.exports = function (app, permission) {

    /**
     * 创建用户
     */
    app.all('/manage/file/create', function (req, res) {

        async.auto({
            currentMenu: function (cb) {
                menuDao.queryMenuByHref('/manage/user', function (err, menu) {
                    if (err || !menu) {
                        cb(null, {});
                    } else {
                        cb(null, menu);
                    }
                });
            },
            userTypes: function (cb) {
                dictUtil.getDictList('sys_user_type', function (err, userTypes) {
                    cb(null, userTypes);
                });
            }
        }, function (error, result) {

            res.render('manage/user/create', {
                currentMenu: result.currentMenu,
                userTypes: result.userTypes
            });
        });
    });

    /**
     * 取得用户文件夹信息
     */
    app.all('/manage/file/getfolders', function (req, res) {
        var type = req.query.type ? req.query.type : 'images'; // 图片类型
        async.auto({
            folders: function (cb) {
                fileDao.queryCatalogByUser(req, type == 'images' ? '1' : '2', function (err, folders) {
                    if (err || !folders) {
                        cb(null, {});
                    } else {
                        cb(null, folders);
                    }
                });
            }
        }, function (error, result) {
            let folders = result.folders;
            if (type == 'images') {
                folders.push({
                    id: 0,
                    name: '我的相册',
                    parent_id: '%',
                    iconSkin: 'customIcon'
                });
            } else {
                folders.push({
                    id: 0,
                    name: '我的文件',
                    parent_id: '%',
                    iconSkin: 'customIcon'
                });
            }

            res.json({
                result: true,
                folders: folders
            });
        });
    });

    /**
     * 取得指定文件夹的文件信息
     */
    app.all('/manage/file/getfiles', function (req, res) {
        let type = req.query.type ? req.query.type : 'images'; // 图片类型
        let currentPage = req.query.page ? req.query.page : 1; // 获取当前页数，如果没有则为1
        let file_cate_id = req.query.file_cate_id ? req.query.file_cate_id : '0';

        async.auto({
            files: function (cb) {
                fileDao.queryFileByCateId(req, file_cate_id, type == 'images' ? 1 : 2, currentPage, 20, function (err, files) {
                    if (err) {
                        console.log(err);
                    } else {
                        cb(null, files);
                    }
                });
            },
            filesPage: function (cb) {
                fileDao.queryFilePageByCateId(req, file_cate_id, type == 'images' ? 1 : 2, currentPage, 20, function (err, page) {
                    if (err) {
                        console.log(err);
                    } else {
                        cb(null, page);
                    }
                });
            }
        }, function (error, result) {
            let files = result.files;
            files.forEach(function (file) {
                file.title = file.ori_name;
                if (file.type == 1) {
                    file.type = 'image';
                } else {
                    file.type = 'file';
                }
            });
            let page = result.filesPage;
            let pageHtml = '<ul><li><a href=javascript:page(" + page.prev + ")>&laquo;</a></li>';
            for (var i = page.min; i <= page.max; i++) {
                pageHtml += '<li ';
                if (page.page == i) {
                    pageHtml += 'class=active';
                }
                pageHtml += '><a href=javascript:page(' + i + ')>' + i + '</a></li>';
            }
            pageHtml += '<li><a href=javascript:page(' + page.next + ')>&raquo;</a></li>';
            pageHtml += '<li><a>共' + page.pagenum + '页 ' + page.total + '条数据</a></li>';
            pageHtml += '</ul>';

            res.json({
                result: true,
                files: files,
                pageHtml: pageHtml
            });
        });
    });

    /**
     * 创建一个文件夹
     */
    app.all('/manage/file/mkdir', function (req, res) {
        let type = req.query.type ? req.query.type : 'images'; // 图片类型
        // let currentPage = req.query.page ? req.query.page : 1; //获取当前页数，如果没有则为1
        let parent_id = req.query.parent_id;
        let parent_ids = req.query.parent_ids ? req.query.parent_ids : '0,';
        let name = req.query.name;
        let sort = req.query.sort;
        async.auto({
            files: function (cb) {
                fileDao.storeFileCate(req, type == 'images' ? 1 : 2, parent_id, parent_ids + parent_id + ',', name, sort, null, null, function (err, result) {
                    cb(null, result);
                });
            }
        }, function (error, result) {

            res.json({
                result: true,
                files: result.files
            });
        });
    });

    /**
     * 删除一个文件夹
     */
    app.all('/manage/file/delfilecate', function (req, res) {
        async.auto({
            delFileCate: function (cb) {
                fileDao.delFileCate(req.body.id, function (err, result) {
                    cb(null, result);
                });
            }
        }, function (error, result) {
            result.delFileCate;

            res.json({
                result: true
            });
        });
    });

    /**
     *  上传一个图片
     */
    app.all('/manage/file/upload', function (req, res) {
        let type = req.query.type ? req.query.type : 'images'; // 文件类型
        let file_cate_id = req.body.file_cate_id ? req.body.file_cate_id : '0';

        if (!req.files)
            return res.status(400).send('No files were uploaded.');

        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        let file = req.files.file;
        let now = new Date();

        // 取得文件的后缀名
        let fileAry = file.name.split('.');
        let ori_name = '';
        for (let i = 0; i < fileAry.length - 1; i++) {
            if (i != 0) {
                ori_name += '.' + fileAry[i];
            } else {
                ori_name += fileAry[i];
            }
        }
        let suffix = fileAry[fileAry.length - 1];
        var fileId = uuidV1();
        let fileDirPath = path.resolve(__dirname, '../../../') + '/public/files/' + now.getFullYear() + '/' + now.getMonth() + '/' + now.getDate() + '/';
        let filePath = '/files/' + now.getFullYear() + '/' + now.getMonth() + '/' + now.getDate() + '/';

        if (fs.existsSync(fileDirPath)) {
            // 不做操作
        } else {
            util.mkdirsSync(fileDirPath);
        }
        if (type == 'images') {
            let dimensions = sizeOf(file.data);
            // Use the mv() method to place the file somewhere on your server
            file.mv(fileDirPath + fileId + '.' + suffix, function (err) {
                if (err)
                    return res.status(500).send(err);

                // 如果有要求进行按比例缩放就进行缩放操作
                if (typeof (req.body.format) != 'undefined') {
                    let format = JSON.parse(req.body.format);
                    let gmImage = gm(fileDirPath + fileId + '.' + suffix);
                    for (let j = 0; j < format.length; j++) {
                        // 先判断是否需要缩放
                        if (!(format[j].width >= dimensions.width && format[j].height >= dimensions.height)) {
                            if (dimensions.width > dimensions.height) {
                                gmImage.resize(format[j].width);
                            } else if (dimensions.width < dimensions.height) {
                                gmImage.resize(null, format[j].height);
                            } else {
                                gmImage.resize(format[j].width, format[j].height);
                            }
                        }

                        gmImage.write(fileDirPath + fileId + '_' + format[j].width + 'x' + format[j].height + '.' + suffix, function (err) {

                        });
                    }
                }

                // 保存文件成功,为数据库增加一条记录
                fileDao.storeFile(req, fileId.replace(/\-/g, ''), (type == 'images' ? 1 : 2), file_cate_id, fileId, dimensions.width, dimensions.height, ori_name, file.data.length, filePath, suffix, req.body.format, null, function (err, result) {
                    res.json({
                        result: true
                    });
                });
            });
        } else {
            file.mv(fileDirPath + fileId + '.' + suffix, function (err) {
                if (err)
                    return res.status(500).send(err);

                // 保存文件成功,为数据库增加一条记录
                fileDao.storeFile(req, fileId.replace(/\-/g, ''), (type == 'images' ? 1 : 2), file_cate_id, fileId, null, null, ori_name, file.data.length, filePath, suffix, null, null, function (err, result) {
                    res.json({
                        result: true
                    });
                });
            });
        }
    });

    /**
     *  缩放图片异步方法
     */
    app.all('/manage/file/thumbfile', function (req, res) {
        let ids = req.body.ids;
        let format = JSON.parse(req.body.format);
        let idsStr = '';
        let idsp = ids.split('|');
        for (let i = 0; i < idsp.length; i++) {
            if (i != idsp.length - 1) {
                idsStr += "'" + idsp[i] + "',";
            } else {
                idsStr += "'" + idsp[i] + "'";
            }
        }

        async.auto({
            files: function (cb) {
                fileDao.queryFileByIds(idsStr, function (err, files) {
                    cb(null, files);
                });
            }
        }, function (error, result) {
            let files = result.files;
            async.map(files, function (file, fileCallback) {
                // 文件的缩放格式是否有修改
                let isFileUpdate = false;
                // 在一个文件开始的时候抓取这个文件的物理地址
                let gmImage = gm(path.resolve(__dirname, '../../../') + '/public' + file.path + file.name + '.' + file.suffix);

                let fileFormatJson = [];
                // 首先判断文件是否本来存在缩放的数组
                if (typeof (file.format) != 'undefined' && file.format != null && file.format != '') {
                    fileFormatJson = JSON.parse(file.format);
                }
                // 如果有在循环目前需要循环的缩放图轨迹时判断是否已存在该种缩略图
                // 开始缩放
                async.map(format, function (imgFormat, formatCallback) {
                    let isExist = false;
                    for (let n = 0; n < fileFormatJson.length; n++) {
                        if (imgFormat.width == fileFormatJson[n].width && imgFormat.height == fileFormatJson[n].height) {
                            isExist = true;
                            break;
                        }
                    }

                    if (!isExist) {
                        isFileUpdate = true;
                        // 先判断是否需要缩放
                        if (!(imgFormat.width >= file.width && imgFormat.height >= file.height)) {
                            if (file.width > file.height) {
                                gmImage.resize(imgFormat.width);
                            } else if (file.width < file.height) {
                                gmImage.resize(null, imgFormat.height);
                            } else {
                                gmImage.resize(imgFormat.width, imgFormat.height);
                            }
                        }

                        gmImage.write(path.resolve(__dirname, '../../../') + '/public' + file.path + file.name + '_' + imgFormat.width + 'x' + imgFormat.height + '.' + file.suffix, function (err) {
                            // console.log('成功进行缩放');
                            formatCallback(null, '_' + imgFormat.width + 'x' + imgFormat.height);
                        });

                        // 不存在的情况下要在操作完成后为老缩放尺寸添加新的尺寸
                        fileFormatJson.push({
                            width: imgFormat.width,
                            height: imgFormat.height
                        });
                    } else {
                        // console.log('我不需要缩放，已经有图了');
                        formatCallback(null, null);
                    }
                }, function (err, results) {
                    fileCallback(null, file.name);
                });
                // 判断是否需要修改缩略格式
                if (isFileUpdate) {
                    fileDao.updateFileFormatById(JSON.stringify(fileFormatJson), file.id, function (err, result) {

                    });
                }
            }, function (err, results) {
                res.json({
                    result: true
                });
            });
        });
    });

    app.all('/manage/file', function (req, res) {
        var type = req.query.type ? req.query.type : 'images'; // 文件类型
        async.auto({
            currentMenu: function (cb) {
                menuDao.queryMenuByHref('/manage/file?type=' + type, function (err, menu) {
                    if (err || !menu) {
                        cb(null, {});
                    } else {
                        cb(null, menu);
                    }
                });
            }
        }, function (error, result) {

            res.render('manage/file/index', {
                currentMenu: result.currentMenu,
                type: type
            });
        });
    });

    app.all('/manage/file/simple', function (req, res) {
        let type = req.query.type ? req.query.type : 'images'; // 文件类型
        let func = req.query.func;
        let format = req.query.format;
        let showFormat = req.query.showFormat;

        async.auto({
            currentMenu: function (cb) {
                menuDao.queryMenuByHref('/manage/file?type=' + type, function (err, menu) {
                    if (err || !menu) {
                        cb(null, {});
                    } else {
                        cb(null, menu);
                    }
                });
            }
        }, function (error, result) {
            res.render('manage/file/file_manage_template', {
                currentMenu: result.currentMenu,
                type: type,
                isDialog: true,
                func: func,
                format: typeof (format) != 'undefined' ? format.replace(/\@/g, '"') : format,
                showFormat: typeof (showFormat) != 'undefined' ? showFormat.replace(/\@/g, '"') : showFormat
            });
        });
    });
};