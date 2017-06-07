const mysql = require('../utils/mysql_db.js');
const util = require('../utils');
const uuidV1 = require('uuid/v1');

/**
 * 根据文件ID查询文件信息
 */
exports.queryFileByIds = function (ids, callback) {
    mysql.query('select sf.* from sys_file sf where sf.id in (' + ids + ')', null, function (err, files) {
        callback(err, files);
    });
};

/**
 * 根据文件ID修改文件缩略图格式
 */
exports.updateFileFormatById = function (format, id, callback) {
    return mysql.update('update sys_file set format=? , update_date=now() where id=?', [format, id]);
};

/**
 * 根据文件类型查询我的目录信息
 */
exports.queryCatalogByUser = function (req, type) {
    let user = req.session.user;

    return mysql.query("select sfc.*,'customIcon' as iconSkin from sys_file_cate sfc where sfc.del_flag = 0 and sfc.type=? and sfc.create_by=?", [type, user.id]);
};

/**
 * 查询一个目录下的文件
 */
exports.queryFileByCateId = function (req, cateId, type, currentPage, pagesize) {
    let user = req.session.user;

    return mysql.query('select sf.* from sys_file sf where sf.del_flag=0 and sf.file_cate_id=? and sf.type=? and sf.create_by=? order by sf.create_date desc limit ' + (parseInt(currentPage) - 1) * pagesize + "," + pagesize,
        [cateId, type, user.id]);
};

/**
 * 查询一个目录下的文件分页信息
 */
exports.queryFilePageByCateId = async function (req, cateId, type, currentPage, pagesize) {
    let user = req.session.user;

    let result = await mysql.queryOne('select count(*) as total from sys_file sf where sf.del_flag=0 and sf.file_cate_id=? and sf.type=? and sf.create_by=?',
        [cateId, type, user.id]);
    return util.makePage(util.getSingleUrl(req), result.total, pagesize, currentPage);
};

/**
 * 上传一个文件
 */
exports.storeFile = function (req, id, type, file_cate_id, name, width, height, ori_name, size, path, suffix, format, remarks) {
    let user = req.session.user;
    return mysql.update('insert into sys_file(id,type,file_cate_id,name,width,height,ori_name,size,path,suffix,format,create_by,create_date,update_by,update_date,remarks,del_flag)'
        + 'values(?,?,?,?,?,?,?,?,?,?,?,?,now(),?,now(),?,0)', [id, type, file_cate_id, name, width, height, ori_name, size, path, suffix, format, user.id, user.id, remarks, 0]);
};

/**
 * 保存一个文件夹
 */
exports.storeFileCate = function (req, type, parent_id, parent_ids, name, sort, description, remarks) {
    let user = req.session.user;

    return mysql.update('insert into sys_file_cate(id,type,parent_id,parent_ids,name,sort,description,create_by,create_date,update_by,update_date,remarks,del_flag)'
        + 'values(?,?,?,?,?,?,?,?,now(),?,now(),?,0)', [util.uuid(), type, parent_id, parent_ids, name, sort, description, user.id, user.id, remarks, 0]);
};

/**
 * 删除一个文件夹
 */
exports.delFileCate = function (cateId) {
    return mysql.update("update sys_file_cate set del_flag=1 where id=? or parent_ids like '%" + cateId + "%'", [cateId]);
};