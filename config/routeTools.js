'use strict';

/**
 * 文件读写工具包
 */
const fs = require('fs');
const console = require('log4js').getLogger('routeTools');
/**
 * 提供载入路由和添加拓展函数的功能
 * @author 大猫猫
 * 
 */
let RouteTools = function () {
    let path = null;
    let express = null;
    let methods = {};
    let routes = {}; // 所有路由列表

    /**
     * express对象代理,用于延时加载路由地址
     */
    let ExpressProxy = function () {
        this.all = function (path, ...requestHandler) {
            routes[path] = {};
            routes[path].method = 'all';
            routes[path].requestHandler = requestHandler;
        };
        this.use = function (path, ...requestHandler) {
            routes[path] = {};
            routes[path].method = 'use';
            routes[path].requestHandler = requestHandler;
        };
        this.get = function (path, ...requestHandler) {
            routes[path] = {};
            routes[path].method = 'get';
            routes[path].requestHandler = requestHandler;
        };
        this.post = function (path, ...requestHandler) {
            routes[path] = {};
            routes[path].method = 'post';
            routes[path].requestHandler = requestHandler;
        };
        this.delete = function (path, ...requestHandler) {
            routes[path] = {};
            routes[path].method = 'delete';
            routes[path].requestHandler = requestHandler;
        };
        this.put = function (path, ...requestHandler) {
            routes[path] = {};
            routes[path].method = 'put';
            routes[path].requestHandler = requestHandler;
        };
    };
    ExpressProxy.prototype = express;
    let expressProxy = new ExpressProxy();
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
                    controller(expressProxy, methods);
                }
            });
    };

    /**
     * 扫描路由
     * @param{express} app
     * @param{function} before 加入路由前的回调函数,this指向express,
     * before 参数列表:routePath,content
     * content 结构:{method:get,requestHandler:function(req,res,next){}})
     * return true:不载入路由,return false 或者不返回,则载入路由
     * @param{string} filePath 要扫描文件路径
     */
    this.scan = function (app, ...filePath) {
        express = app;
        if (!filePath || filePath.length === 0) {
            throw new Error('The filePath cannot be empty');
        }
        console.info('loadding routes start...');
        for (let i = 0; i < filePath.length; i++) {
            path = filePath[i];
            scan();
        }
        console.info('loadding routes end...');
    };

    /**
     * 得到所有载入的路由
     * @param{function} filter 过滤回调,参数routeList,return routeList
     */
    this.getRoutes = function () {
       return routes;
    };
    /**
     * 执行载入路由
     * @param{object} routes要载入的路由,可以从方法getRoutes得到并改变
     */
    this.excute = function (routes) {
        for (let n in routes) {
            express[routes[n].method](n, routes[n].requestHandler);
        }
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