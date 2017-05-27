'use strict';

/**
 * 文件读写工具包
 */
const fs = require('fs');

/**
 * 提供载入路由和添加拓展函数的功能
 * @author 大猫猫
 * 
 */
let RouteTools = function () {
    let path = null;
    let express = null;
    let methods = {};
    let scan = function (action) {
        action = action || '';
        action && (path += action);
        fs.readdirSync(path)
            .forEach((file) => {
                if (fs.statSync(path + '/' + file).isDirectory()) {
                    scan(action + '/' + file);
                    return;
                }
                // 不是js文件直接跳过
                if (!file.endsWith('.js')) {
                    return;
                }
                var controller = require(path + '/' + file);
                if (Object.prototype.toString.call(controller) === '[object Function]') {
                    controller(express, methods);
                }
            });
    };

    /**
     * 扫描并载入路由
     * @param{express} app
     * @param{string} filePath 要扫描文件路径
     */
    this.scan = function (app, ...filePath) {
        express = app;
        if (!filePath || filePath.length === 0) {
            throw new Error('The filePath cannot be empty');
        }
        console.log('loadding routes start...');
        for (let i = 0; i < filePath.length; i++) {
            path = filePath[i];
            scan();
        }
        console.log('loadding routes end...');
    };

    /**
     * 拓展路由处理方法,为controller的routeMethod对象添加方法
     * @param methodName 方法名称
     * @param fun 处理函数
     */
    this.addRouteMethod = function (methodName, fun) {
        if (!methodName) {
            throw new Error('The methodName is empty');
        }
        if (!methodName) {
            throw new Error('The methodName is empty');
        }
        methods[methodName] = fun;
    };

    let validates = {};

    /**
     * 添加验证url验证方法
     * @param {string} methodName 调用验证结果的方法名称
     * @param {function} fun 处理函数
     */
    this.addValidateMethod = function (methodName, fun) {
        if (!methodName) {
            throw new Error('The methodName is empty');
        }
        if (Object.prototype.toString.call(fun) !== '[object Function]') {
            throw new Error('The fun must be a function');
        }
        validates[methodName] = fun;
    };

    /**
     * 校验url权限
     * @param {string} req request
     * @param {string} res response
     * @return {object} result 各种校验类型的结果
     * 例如:
     * result = {
     *  session:function(){
     *    return false;
     *  },
     *  sign : function(){
     *    return true;
     *  }
     * }
     */
    this.validate = function (req, res) {
        var result = {};
        for (let n in validates) {
            result[n] = validates[n](req, res);
        }
        return result;
    };
};

module.exports = new RouteTools();