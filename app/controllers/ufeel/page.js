'use strict';

/**
 * Module dependencies.
 */
const utils = require('../../utils');
const cateDao = require('../../dao/cms_category.js');
const articleDao = require('../../dao/cms_article.js');
const guestbookDao = require('../../dao/cms_guestbook.js');


module.exports = function (app, routeMethod) {
  /**
   * 网页首页
   */
  app.all('/ufeel', function (req, res) {
    let siteId = 'c46f915050dd11e79e03715d6c7b2c7d';

    Promise.all([
      cateDao.queryCmsCateForRecursion(siteId),
      // 我们做什么的图片
      articleDao.queryArticleInfoByCateId('c8172dd050e311e7875527e3b303b0fb'),
      // 团队成员的图片
      articleDao.queryArticleInfoByCateId('94d9e41050e511e7875527e3b303b0fb'),
      // 企业应用作品
      articleDao.queryArticleInfoByCateId('b389cef050e711e7875527e3b303b0fb'),
      // 个人网站作品
      articleDao.queryArticleInfoByCateId('c96dc05050e711e7875527e3b303b0fb'),
      // 移动端作品
      articleDao.queryArticleInfoByCateId('01ed198050e811e7875527e3b303b0fb'),
      // 智能硬件作品
      articleDao.queryArticleInfoByCateId('223fc9d050e811e7875527e3b303b0fb'),
      // 新闻
      articleDao.queryArticleInfoByCateId('81bb577050e911e7875527e3b303b0fb'),
      // 新闻标题信息
      articleDao.queryArticleInfoByCateId('0b0e546050e911e7875527e3b303b0fb'),
      // 团队信息
      articleDao.queryArticleInfoByCateId('8e163db050e311e7875527e3b303b0fb'),
      // 准备联系我们
      articleDao.queryArticleInfoByCateId('885496a050e411e7875527e3b303b0fb'),
      // 我们的顾客说
      articleDao.queryArticleInfoByCateId('d901d46050e811e7875527e3b303b0fb'),
      // 我们的特说
      articleDao.queryArticleInfoByCateId('01b7ae7050e411e7875527e3b303b0fb'),
      // 工作模式
      articleDao.queryArticleInfoByCateId('342b66a050e211e7875527e3b303b0fb'),
      // todowork
      articleDao.queryArticleInfoByCateId('caec153050e211e7875527e3b303b0fb'),
      // 友情连接LOGO
      articleDao.queryArticleInfoByCateId('4559c290510b11e793fd39b7741cea1f'),
      // services
      articleDao.queryArticleInfoByCateId('0919260050e711e7875527e3b303b0fb'),
      // 服务
      articleDao.queryArticleInfoByCateId('bf2f078050e611e7875527e3b303b0fb'),
      // 我们的联系方式
      articleDao.queryArticleInfoByCateId('ade10740510d11e793fd39b7741cea1f'),
    ]).then(result => {
      res.render('ufeel/index', {
        cates: result[0],
        ourTodoImg: result[1],
        teamMem: result[2],
        qiyezuopin: result[3],
        gerenzuopin: result[4],
        yidongzuopin: result[5],
        yingjianzuopin: result[6],
        news: result[7],
        newsTitle: result[8],
        teamInfo: result[9],
        readyUs: result[10],
        says: result[11],
        tese: result[12],
        workPattern: result[13],
        todoWorks: result[14],
        logos: result[15],
        services: result[16],
        fuwu: result[17],
        contact: result[18]
      });
    });
  });

  /**
   * 网站案例页
   */
  app.all('/ufeel/cases', function (req, res) {
    let siteId = 'c46f915050dd11e79e03715d6c7b2c7d';
    let currentPage = req.query.page ? req.query.page : 1; // 获取当前页数，如果没有则为1

    Promise.all([
      cateDao.queryCmsCateForRecursion(siteId),
      // 网站案例
      articleDao.queryAllArticleByCateIds(['b389cef050e711e7875527e3b303b0fb','c96dc05050e711e7875527e3b303b0fb','01ed198050e811e7875527e3b303b0fb'
      ,'223fc9d050e811e7875527e3b303b0fb'],req,currentPage,20),
      articleDao.queryAllArticlePageByCateIds(['b389cef050e711e7875527e3b303b0fb','c96dc05050e711e7875527e3b303b0fb','01ed198050e811e7875527e3b303b0fb'
      ,'223fc9d050e811e7875527e3b303b0fb'],req,20,currentPage),
    ]).then(result => {

      res.render('ufeel/cases', {
        cates: result[0],
        cases: result[1],
        casesPage: result[2],
        cate_id: req.query.cate_id ? req.query.cate_id : '0'
      });
    });
  });

  /**
   * 我们的模板库页面
   */
  app.all('/ufeel/template',async function (req, res) {
    let siteId = 'c46f915050dd11e79e03715d6c7b2c7d';
    let currentPage = req.query.page ? req.query.page : 1; // 获取当前页数，如果没有则为1
    // 查看所有的模板类型的分类
    let children = await cateDao.queryChildrenCateById('51ba08e0549b11e79dcadb83d1b88d12');
    let cateIds = [];
    children.forEach(cate => {
      cateIds.push(cate.id);
    });

    Promise.all([
      cateDao.queryCmsCateForRecursion(siteId),
      // 模板信息
      articleDao.queryAllArticleByCateIds(cateIds,req,currentPage,20),
      articleDao.queryAllArticlePageByCateIds(cateIds,req,20,currentPage),
    ]).then(result => {
      res.render('ufeel/template', {
        cates: result[0],
        cate_children: children,
        cases: result[1],
        casesPage: result[2],
        cate_id: req.query.cate_id ? req.query.cate_id : '0'
      });
    });
  });

  /**
   * 根据板块进行留言
   */
  app.all('/ufeel/msgboard',async function (req, res) {
    let result = guestbookDao.saveGuestbook(req);
    if (result){
      res.json({
        result:true
      });
    } else {
      res.json({
        result:false
      });
    }
  });
};