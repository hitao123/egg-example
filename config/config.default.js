'use strict';

module.exports = appInfo => {
  const config = {};

  config.keys = appInfo.name + '_1519887194138_3450';
  // add your config here 这里不做配置， ejs 模板获取不到值
  config.middleware = [ 'locals', 'authUser' ];
  // cdn host，如 http://cnodejs.qiniudn.com
  config.site_static_host = process.env.EGG_SITE_STATIC_HOST || ''; // 静态文件存储域名
  config.mini_assets = process.env.EGG_MINI_ASSETS || false;

  config.name = 'CNode技术社区';

  config.site_logo = '/public/images/cnodejs_light.svg';
  config.site_icon = '/public/images/cnode_icon_32.png';

  // 版块
  config.tabs = [[ 'share', '分享' ], [ 'ask', '问答' ], [ 'job', '招聘' ]];

  // debug 为 true 时，用于本地调试
  config.debug = true;

  // 是否允许直接注册（否则只能走 github 的方式）
  config.allow_sign_up = true;

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
    url: process.env.EGG_MONGODB_URL || 'mongodb://127.0.0.1:27017/egg_example',
    options: {
      server: { poolSize: 20 },
    },
  };

  // passport
  config.passportGithub = {
    key: process.env.EGG_PASSPORT_GITHUB_CLIENT_ID || 'test',
    secret: process.env.EGG_PASSPORT_GITHUB_CLIENT_SECRET || 'test',
  };

  config.passportLocal = {
    usernameField: 'name',
    passwordField: 'pass',
  };

  config.topic = {
    perDayPerUserLimitCount: 10,
  };

  config.list_topic_count = 20;

  // 每个 IP 每天可创建用户数
  config.create_user_per_ip = 1000;

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

  config.session_secret = 'test';

  config.siteFile = {
    '/favicon.ico': '/public/images/cnode_icon_32.png',
  };

  config.auth_cookie_name = 'egg_example';

  config.admins = {
    ADMIN_USER: true,
  };

  config.default_page = 1;

  return config;
};
