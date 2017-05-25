# Nodejs Express Mysql Demo

这是一个非常全面的nodejs框架，不仅仅解决后台的框架和常用工具，还大幅度的为前端提供了很多丰富的插件，为开发提供很多便捷。目前版本主要是针对mysql为主的后台管理系统

## 我们核心解决的问题列表

(一)业务方面<br/>
1.登录注册权限控制<br/>
2.用户管理、角色管理、菜单管理、区域管理、机构管理<br/>
3.用户日志监控、系统监控<br/>

(二)系统方面<br/>
1.上传工具及其下载功能、缩放、裁剪等功能<br/>
2.支持excel上传下载处理<br/>
3.支持mysql数据库的操作<br/>
4.支持菜单访问权限的控制<br/>
5.支持redis集群<br/>
6.支持数据库读写分离<br/>
7.支持生成静态文件处理<br/>
8.提供分页查询前后台所需的相关工具<br/>
9.提供前端常用插件如select选项卡、弹出框选属性选项卡(异步、同步都支持)、手机和PC富客服端编辑器<br/>


## 必须要安装的插件

* [NodeJs](http://nodejs.org) >= 6.x 
* ~~[imagemagick](http://www.imagemagick.org/script/index.php)~~

## 安装

```sh
$ git clone https://github.com/dongheng76/nodejs-demo.git
$ npm install
```
## 目录脚手架介绍<br/>
-app 存放核心应用层的文件夹<br/>
　　-controllers 存放控制层的文件夹<br/>
　　-dao 存放数据库操作工具<br/>
　　-models 模型层使用orm规范需要的对象文件夹，目前无使用<br/>
　　-routes 常用路由集合的文件夹<br/>
　　-utils 常用与业务无关的工具类文件夹<br/>
　　-view 存放html页面的文件夹<br/>
-config 核心配置的文件夹<br/>
-db 存放系统sql备份的文件夹<br/>
-public 存放静态文件的文件目录<br/>

## 正式启动

```sh
$ npm start
```

## 测试地址与帐号
http://nodejs-demo.com
killer
********

## 联系我们
QQ:6347536 注明nodejs-demo

## License

MIT
