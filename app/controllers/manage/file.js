'use strict';

/**
 * Module dependencies.
 */

const async = require('async');
const utils = require('../../utils');
const validator = require('validator');
const menuDao = require('../../dao/menu');
const fileDao = require('../../dao/file');
const util = require('../../utils');
const dictUtil = require('../../utils/dict_utils');
const moment = require('moment');
const uuidV1 = require('uuid/v1');
const path = require('path');
//文件读写操作
const fs = require('fs');
const sizeOf = require('image-size');

/**
 * 创建用户
 */
exports.create = function (req, res) {

    async.auto({
        currentMenu: function (cb) {
            menuDao.queryMenuByHref("/manage/user", function (err, menu) {
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
};

/**
 * 取得用户文件夹信息
 */
exports.getfolders = function (req, res) {
    var type = req.query.type ? req.query.type : 'image'; //图片类型
    async.auto({
        folders: function (cb) {
            fileDao.queryCatalogByUser(req, type == 'image' ? '1' : '2', function (err, folders) {
                if (err || !folders) {
                    cb(null, {});
                } else {
                    cb(null, folders);
                }
            });
        }
    }, function (error, result) {
        let folders = result.folders;
        if (type == 'image') {
            folders.push({id: 0, name: '我的相册', parent_id: '%', iconSkin: 'customIcon'});
        } else {
            folders.push({id: 0, name: '我的文件', parent_id: '%', iconSkin: 'customIcon'});
        }

        res.json({
            result: true,
            folders: folders
        });
    });
}

/**
 * 取得指定文件夹的文件信息
 */
exports.getfiles = function (req, res) {
    let type = req.query.type ? req.query.type : 'image'; //图片类型
    let currentPage = req.query.page ? req.query.page : 1; //获取当前页数，如果没有则为1
    let file_cate_id = req.query.file_cate_id ? req.query.file_cate_id : '0';

    async.auto({
        files: function (cb) {
            fileDao.queryFileByCateId(req,file_cate_id,type=='image'?1:2,currentPage,20,function(err,files){
                if(err){
                    console.log(err);
                }else{
                    cb(null,files);
                }
            })
        },
        filesPage: function (cb) {
            fileDao.queryFilePageByCateId(req,file_cate_id,type=='image'?1:2,currentPage,20,function(err,page){
                if(err){
                    console.log(err);
                }else{
                    cb(null,page);
                }
            })
        }
    }, function (error, result) {
        let files = result.files;
        files.forEach(function(file){
            file.title = file.ori_name;
            if(file.type==1){
                file.type = 'image';
            }else{
                file.type = 'file';
            }
        });
        let page = result.filesPage;
        let pageHtml = "<ul><li><a href=javascript:page("+page.prev+")>&laquo;</a></li>";
        for(var i=page.min; i<=page.max; i++) {
            pageHtml += "<li "
            if(page.page==i){
                pageHtml += "class=active";
            }
            pageHtml +="><a href=javascript:page("+i+")>"+i+"</a></li>";
        }
        pageHtml += "<li><a href=javascript:page("+page.next+")>&raquo;</a></li>";
        pageHtml +="<li><a>共"+page.pagenum+"页 "+page.total+"条数据</a></li>";
        pageHtml +="</ul>";

        res.json({
            result: true,
            files: files,
            pageHtml:pageHtml
        });
    });
}

/**
 * 创建一个文件夹
 */
exports.mkdir = function (req, res) {
    let type = req.query.type ? req.query.type : 'image'; //图片类型
    let currentPage = req.query.page ? req.query.page : 1; //获取当前页数，如果没有则为1
    let parent_id = req.query.parent_id;
    let parent_ids = req.query.parent_ids?req.query.parent_ids:'0,';
    let name = req.query.name;
    let sort = req.query.sort;
    async.auto({
        files: function (cb) {
            fileDao.storeFileCate(req, type == 'image' ? 1 : 2, parent_id, parent_ids+parent_id+',', name, sort, null, null, function (err, result) {
                cb(null,result);
            });
        }
    }, function (error, result) {

        res.json({
            result: true,
            files: result.files
        });
    });
}

/**
 * 删除一个文件夹
 */
exports.delfilecate = function (req, res) {
    async.auto({
        delFileCate: function (cb) {
            fileDao.delFileCate(req.body.id, function (err, result) {
                cb(null,result);
            });
        }
    }, function (error, result) {
        result.delFileCate;

        res.json({
            result: true
        });
    });
}

/**
 *  显示用户详情
 */
exports.show = function (req, res) {

};

/**
 *  上传一个图片
 */
exports.upload = function (req, res) {
    let type = req.query.type ? req.query.type : 'images'; //文件类型
    let file_cate_id = req.body.file_cate_id ? req.body.file_cate_id : '0';

    if (!req.files)
        return res.status(400).send('No files were uploaded.');

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let file = req.files.file;
    let now = new Date();

    //取得文件的后缀名
    let fileAry = file.name.split('.');
    let ori_name = '';
    for(let i=0;i<fileAry.length-1;i++){
        if(i!=0){
            ori_name+='.'+fileAry[i];
        }else{
            ori_name+=fileAry[i];
        }
    }
    let suffix = fileAry[fileAry.length - 1];
    var fileId = uuidV1();
    let fileDirPath = path.resolve(__dirname, '../../../') + '/public/files/' + now.getFullYear() + '/' + now.getMonth() + '/' + now.getDate()+ '/';
    let filePath =  '/files/' + now.getFullYear() + '/' + now.getMonth() + '/' + now.getDate()+ '/';

    if (fs.existsSync(fileDirPath)) {
    } else {
        util.mkdirsSync(fileDirPath);
    }

    let dimensions = sizeOf(file.data);
    // Use the mv() method to place the file somewhere on your server
    file.mv(fileDirPath  + fileId + '.' + suffix, function (err) {
        if (err)
            return res.status(500).send(err);

        //保存文件成功,为数据库增加一条记录
        fileDao.storeFile(req,fileId.replace(/\-/g,''),(type=='image'?1:2),file_cate_id,fileId,dimensions.width,dimensions.height,ori_name,file.data.length,filePath,suffix,null,null,function(err,result){
            res.json({
                result:true
            });
        });
    });
};

/**
 *  删除一个用户信息
 */
exports.delete = function (req, res) {

};

exports.index = function (req, res) {
    var type = req.query.type ? req.query.type : 'images'; //文件类型
    async.auto({
        currentMenu: function (cb) {
            menuDao.queryMenuByHref("/manage/file?type=images", function (err, menu) {
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
};
