'use strict';

module.exports = appInfo => {
  const config = {};

  config.keys = appInfo.name + '_1519887194138_3450';
  // add your config here 这里不做配置， ejs 模板获取不到值
  config.middleware = [ 'locals' ];
  // cdn host，如 http://cnodejs.qiniudn.com
  config.site_static_host = process.env.EGG_SITE_STATIC_HOST || ''; // 静态文件存储域名
  config.mini_assets = process.env.EGG_MINI_ASSETS || false;

  config.name = 'CNode技术社区';

  // 版块
  config.tabs = [[ 'share', '分享' ], [ 'ask', '问答' ], [ 'job', '招聘' ]];

  // RSS配置
  config.rss = {
    title: 'CNode：Node.js专业中文社区',
    link: 'http://cnodejs.org',
    language: 'zh-cn',
    description: 'CNode：Node.js专业中文社区',
    // 最多获取的RSS Item数量
    max_rss_items: 50,
  };

  config.description = 'CNode：Node.js专业中文社区';

  config.host = 'http://cnodejs.org';

  config.news = {
    serverUrl: 'https://cnodejs.org/api/v1/topics',
    pageSize: 10,
  };

  config.view = {
    defaultViewEngine: 'ejs',
    mapping: {
      '.html': 'ejs',
    },
  };

  config.ejs = {
    layout: 'layout.html',
  };

  // database cache
  config.redis = {
    client: {
      host: process.env.EGG_REDIS_HOST || '127.0.0.1',
      port: process.env.EGG_REDIS_PORT || 6379,
      password: process.env.EGG_REDIS_PASSWORD || '',
      db: process.env.EGG_REDIS_DB || '0',
    },
  };
  // database
  config.mongoose = {
    url: process.env.EGG_MONGODB_URL || 'mongodb://127.0.0.1:27017/egg_cnode',
    options: {
      server: { poolSize: 20 },
    },
  };
  // 邮箱配置
  config.mail_opts = {
    host: 'smtp.126.com',
    port: 25,
    auth: {
      user: 'club@126.com',
      pass: 'club',
    },
    ignoreTLS: true,
  };

  config.security = {
    csrf: {
      ignore: '/api/*/*',
    },
  };

  return config;
};
