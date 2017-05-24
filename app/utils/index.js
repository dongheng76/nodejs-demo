const crypto = require('crypto');
const fs = require("fs");
const path = require("path");
const uuidV1 = require('uuid/v1');

/**
 * 格式化日期
 */
exports.format_date = function (date, friendly) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();

  if (friendly) {
    var now = new Date();
    var mseconds = -(date.getTime() - now.getTime());
    var time_std = [1000, 60 * 1000, 60 * 60 * 1000, 24 * 60 * 60 * 1000];
    if (mseconds < time_std[3]) {
      if (mseconds > 0 && mseconds < time_std[1]) {
        return Math.floor(mseconds / time_std[0]).toString() + ' 秒前';
      }
      if (mseconds > time_std[1] && mseconds < time_std[2]) {
        return Math.floor(mseconds / time_std[1]).toString() + ' 分钟前';
      }
      if (mseconds > time_std[2]) {
        return Math.floor(mseconds / time_std[2]).toString() + ' 小时前';
      }
    }
  }

  hour = ((hour < 10) ? '0' : '') + hour;
  minute = ((minute < 10) ? '0' : '') + minute;
  second = ((second < 10) ? '0' : '') + second;

  return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
};

/**
 * 生成没有-的UUID
 */
exports.uuid = function () {
  return uuidV1().replace(/\-/g, '');
}

/**
 * 加密函数
 *
 * @param str 源串
 * @param secret  因子
 * @returns
 */
exports.encrypt = function (str, secret) {
  var cipher = crypto.createCipher('aes192', secret);
  var enc = cipher.update(str, 'utf8', 'hex');
  enc += cipher.final('hex');
  return enc;
};

/**
 * 解密
 *
 * @param str
 * @param secret
 * @returns
 */
exports.decrypt = function (str, secret) {
  var decipher = crypto.createDecipher('aes192', secret);
  var dec = decipher.update(str, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
};

/**
 * md5 hash
 *
 * @param str
 * @returns
 */
exports.md5 = function (str) {
  var md5sum = crypto.createHash('md5');
  md5sum.update(str);
  str = md5sum.digest('hex');
  return str;
};

exports.isObject = function (obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

exports.makePage = function (pagePath, total, pagesize, page) {
  page = parseInt(page);
  var pagenum = Math.ceil(total / pagesize);

  var min = page > 3 ? page - 2 : 1;
  var max = page + 2 > pagenum ? pagenum : min + 2;
  return {
    pagePath: pagePath,
    pagenum: pagenum,
    total: total,
    pagesize: pagesize,
    page: page,
    min: min,
    max: max,
    prev: page - 1 > 0 ? page - 1 : 1,
    next: page + 1 < pagenum ? page + 1 : pagenum
  };
};

exports.getSingleUrl = function (req) {
  var url = req.originalUrl; //获取当前url，并把url中page参数过滤掉
  url = url.replace(/([?&]*)page=([0-9]+)/g, '');
  if (/[?]+/.test(url)) {
    url += '&';
  } else {
    url += '?';
  }
  return url;
}

exports.getIPAdress = function () {
  var interfaces = require('os').networkInterfaces();
  for (var devName in interfaces) {
    var iface = interfaces[devName];
    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address;
      }
    }
  }
};

// 递归创建目录 异步方法
function mkdirs (dirname, callback) {
  fs.exists(dirname, function (exists) {
    if (exists) {
      callback();
    } else {
      mkdirs(path.dirname(dirname), function () {
        fs.mkdir(dirname, callback);
      });
    }
  });
}

// 递归创建目录 同步方法
function mkdirsSync (dirname) {
  if (fs.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }
}

exports.mkdirs = mkdirs;
exports.mkdirsSync = mkdirsSync;

/**
 * 把规定的json数据换成treejson数据
 * @param json
 * @returns {Array}
 */
exports.jsonToTreeJson = function (json, rootId) {
  let treeJson = [];
  rootId = rootId ? rootId : '1';

  // 先找到第一层后开始递归
  for (let i = 0; i < json.length; i++) {
    if (json[i].parent_id == rootId) {
      findChildrenByPId(json, json[i]);
      treeJson.push(json[i]);
    }
  }
  return treeJson;
};

function findChildrenByPId (json, obj) {
  let children = [];
  for (let i = 0; i < json.length; i++) {
    if (json[i].parent_id == obj.id) {
      findChildrenByPId(json, json[i]);
      children.push(json[i]);
    }
  }
  if (children.length > 0) {
    obj.children = children;
  }
}