'use strict';

const join = require('path').join; // 连接字符串方法
const path = join(__dirname, '../app/controllers');
const routeTools = require('./routeTools');
const urlTools = require('url');
const env = process.env.NODE_ENV || 'development';
const csrf = require('csurf');
const envConfig = require('./index');

/**
 * 添加session路由方法以及添加校验方法
 */
~ function () {
  let sessionPermissions = {};
  /**
   * 添加验证session的url地址处理方法
   */
  routeTools.addRouteMethod('session', function (url, ...values) {
    if (!url || Object.prototype.toString.call(url) !== '[object String]') {
      throw new Error('permission url muse be string and not empty');
    }
    url = url.trim();
    if (!values || values.length === 0) {
      throw new Error('url: ' + url + ' permission value is empty');
    }
    let result = [];
    values.forEach(function (element) {
      if (Object.prototype.toString.call(element) === '[object String]') {
        result.push(element.trim());
      }
    }, this);
    if (result.length === 0) {
      throw new Error('url: ' + url + ' permission value is empty');
    }
    sessionPermissions[url] = result.join(',');
  });

  /**
   * 校验页面配置属性是否存在用户session中
   * @param {*} req 
   * @param {*} value 
   */
  let pageValidate = function (req, value) {
    if (!value || Object.prototype.toString.call(value) !== '[object String]') {
      throw new Error('PERMISSION value muse be string and not empty');
    }
    if (!req.session || !req.session.menus) {
      return false;
    }
    let values = value.split(',');
    for (let i = 0; i < values.length; i++) {
      values[i] = values[i].trim();
    }
    let menus = req.session.menus;
    for (let i = 0; i < menus.length; i++) {
      if (values.includes(menus[i].permission)) {
        return true;
      }
    }
    return false;
  };

  /**
   * @return 返回none表示不验证session,success表示session验证成功,fail表示失败
   */
  routeTools.addValidateMethod('session', function (req, res) {
    let url = urlTools.parse(req.url).pathname;
    let value = sessionPermissions[url];

    if (!value) {
      return true;
    }
    if (!req.session || !req.session.user || !req.session.menus) {
      res.redirect('/manage/login');
      return false;
    }
    let values = value.split(',');
    let menus = req.session.menus;
    for (let i = 0; i < menus.length; i++) {
      if (values.includes(menus[i].permission)) {
        // session验证成功则为页面添加校验属性权限的方法
        res.locals.PERMISSION = function (value) {
          return pageValidate(req, value);
        };
        return true;
      }
    }
    res.status(403).render('403');
    return false;
  });
}();

/**
 * 添加session路由方法以及添加校验方法
 */
~ function () {
  let sessionPermissions = [];
  /**
   * 添加验证session的url地址处理方法
   */
  routeTools.addRouteMethod('weixinSession', function (url) {
    if (!url || Object.prototype.toString.call(url) !== '[object String]') {
      throw new Error('permission url muse be string and not empty');
    }
    sessionPermissions.push(url.trim());
  });

  /**
   * @return 返回true表示session验证成功,false表示失败
   */
  routeTools.addValidateMethod('weixinSession', function (req, res) {
    let url = urlTools.parse(req.url).pathname;
    if (!sessionPermissions.includes(url)) {
      return true;
    }
    if (!req.session || !req.session.weixinUser) {
      /* req.session.weixinUser = {
        userId:'ef33dbe06d1a11e7b0888d5cfe5cb851',
        user_parent_id: null,
        user_union_id: 'o8tmf1SKPfrswmrXvry6lqYm1UGo',
        user_login_name: null,
        user_is_proxy: 0,
        user_name: '董恒',
        user_photo: 'http://wx.qlogo.cn/mmhead/hqDXUD6csUibS9dA7LdUPKuchYthicHZiaO2h62ODU33BBu3RMb8OKFZA/0'
      };
      return true; */
      let winxinCallbackUrl = envConfig.server.myUrl + '/api/weixin/req_weixinuser_info';
      let visitUrl = req.protocol + '://' + req.host + req.originalUrl;
      res.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx72878a9eb500ef96&redirect_uri=' + encodeURIComponent(winxinCallbackUrl).toLowerCase() + '&response_type=code&scope=snsapi_userinfo&state=' + encodeURIComponent(visitUrl).toLowerCase() + '#wechat_redirect');
      return false;
    }
    return true;
  });
}();

/**
 * 添加sign路由方法以及添加sign校验方法
 */
~ function () {

  /**
   * 验证sign名具体代码
   * @param {*} req 
   * @param {*} res 
   */
  let signValidate = function (req, res) {
    /*
    如果验证失败,返回结果取消此段注释
    res.json({
        result: 403,
        message: "You don't have permission"
      });
    return false;
    */
    return true;
  };

  let signPermissions = [];
  /**
   * @return 返回true表示session验证成功,false表示失败
   */
  routeTools.addRouteMethod('sign', function (url) {
    if (!url || Object.prototype.toString.call(url) !== '[object String]') {
      throw new Error('sign url is empty');
    }
    signPermissions.push(url.trim());
  });

  routeTools.addValidateMethod('sign', function (req, res) {
    let url = urlTools.parse(req.url).pathname;
    if (!signPermissions.includes[url]) {
      return true;
    }
    return signValidate(req, res);
  });
}();


/**
 * 添加防重复提交验证令牌url
 */
let Csurf = function () {


  let csrfs = [];
  /**
   * @return 返回none表示不验证session,success表示session验证成功,fail表示失败
   */
  routeTools.addRouteMethod('csurf', function (path) {
    if (!path || Object.prototype.toString.call(path) !== '[object String]') {
      throw new Error('path url is empty');
    }
    csrfs.push(path.trim());
  });

  this.getPath = function () {
    return csrfs;
  };

};

let csurf = new Csurf();

/**
 * Expose routes
 */
module.exports = function (app) {

  // routes相关拦截
  app.use(function (req, res, next) {
    let result = routeTools.validate(req, res);
    for (let r in result) {
      if (result.hasOwnProperty(r)) {
        if (!result[r]) {
          return;
        }
      }
    }
    next();
  });

  routeTools.scan(app, path); // 扫描路由到工具
  let routes = routeTools.getRoutes(); // 得到扫描到的路由
  let routesGroup = {};
  let csurfGroup = {};
  let csurfPath = csurf.getPath();
  for (let i in routes) {
    if (csurfPath.includes(i)) {
      csurfGroup[i] = routes[i];
    } else {
      routesGroup[i] = routes[i];
    }
  }
  routeTools.excute(routesGroup); // 执行添加路由(必须先声明权限拦截在执行添加路由,否则无法拦截路由地址)

  if (env !== 'test') {
    app.use(csrf());

    // This could be moved to view-helpers :-)
    app.use(function (req, res, next) {
      let t = req.csrfToken();
      res.locals.csrf_token = t;
      next();
    });

    // error handler
    app.use(function (err, req, res, next) {
      if (err.code !== 'EBADCSRFTOKEN') return next(err);
      res.status(403).json({
        result: 403,
        message: "You don't have permission"
      });
      return false;
    });
  }

  routeTools.excute(csurfGroup);

  /**
   * Error handling
   */
  app.use(function (err, req, res, next) {
    // treat as 404
    if (err.message &&
      (~err.message.indexOf('not found') ||
        (~err.message.indexOf('Cast to ObjectId failed')))) {
      return next();
    }

    console.error(err.stack);

    if (err.stack.includes('ValidationError')) {
      res.status(422).render('422', {
        error: err.stack
      });
      return;
    }

    // error page
    res.status(500).render('500', {
      error: err.stack
    });
  });

  // assume 404 since no middleware responded
  app.use(function (req, res) {
    const payload = {
      url: req.originalUrl,
      error: 'Not found'
    };
    // if (req.accepts('json')) return res.status(404).json(payload);
    res.status(404).render('404', payload);
  });
};