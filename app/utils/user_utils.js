const redisUtils = require('./redis_utils');
const preUser = 'user:';

/**
 * 保存用户信息到redis中
 */
exports.saveUser = function(user){
    redisUtils.setObject(preUser+user.id,user);
}

/**
 * 从redis中取得用户信息
 */
function getUserInfo(req,callback){
    redisUtils.getObject(req.session.user);
}