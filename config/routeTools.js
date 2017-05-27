'use strict';

/**
 * 文件读写工具包
 */
const fs = require('fs');

/**
 * 提供载入路由和权限的功能
 * @author 大猫猫
 */
let RouteTools = function () {
    let path = null;
    let express = null;
    let permissions = {}; // 路由地址和权限属性的映射
    /**
     * 添加路由允许的权限值
     * @param {*} url 路由地址
     * @param {*} values 被允许的权限值
     */
    var permission = function (url, ...values) {
        if (!url) {
            throw new Error('permission url is empty');
        }
        if (!values || values.length === 0) {
            throw new Error('url: ' + url + ' permission value is empty');
        }
        permissions[url] = values.join(',');
    };
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
                    controller(express, permission);
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
     * 校验url权限
     * @param {string} req request请求
     * @return {string} success 表示成功, session 表示session校验失败 , sign 表示签名校验失败
     */
    this.validate = function (req) {
        if (express === null) {
            throw new Error('The route has not been loaded. Execute after invoking the scan method');
        }
        let url = req.originalUrl;
        let allow = permission[url];
        return 'success';
    };
};

module.exports = new RouteTools();