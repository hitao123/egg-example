# 学习 eggjs框架 开发nodejs项目

## cnodejs

> cnodejs 是一个提供中国 nodejs 爱好者分享一些nodejs相关知识，以及问答和招聘以及提供 api 供开发者调用学习的技术社区，
站点需要提供的功能有注册、登录、发布话题、评论的功能的一个站点，[nodeclub](https://github.com/cnodejs/nodeclub)
是最初版本使用 express 开发，后面使用 eggjs (koa) 重构 [egg-cnode](https://github.com/cnodejs/egg-cnode)项目
现在使用，社区还有好多调用 api 开发 h5 版本的，[列表如下](https://github.com/search?q=cnode), 这里真的要感谢cnode
社区提供这个api, 我学习 react 的时候，也是做这个小项目起步的，[react-cnode](https://github.com/hitao123/react-cnode)。

## 后端数据结构分析

> user topic 表是最重要的，reply topic_collect message 都是以前两张表相关的，每张表都有一个主键如 `"_id" : ObjectId("5b0ab2b091a9e80aa9177318")`

### 表结构

topic 表

  | field | type | default | detail |
  | ------ | ------ |---| -- |
  | title | String |  | 主题标题 |
  | content | String |  | 内容 |
  | author_id | ObjectId |  | 作者id |
  | top | Boolean | false | 置顶帖 |
  | good | Boolean | false | 精华帖 |
  | lock | Boolean | false | 被锁定主题 |
  | reply_count | Number | 0 | 回复数 |
  | visit_count | Number | 0 | 阅读量 |
  | collect_count | Number | 0 | 收藏数 |
  | create_at | Date | Date.now | 创建时间 |
  | update_at | Date | Date.now | 更新时间 |
  | last_reply | ObjectId |  | 上次回复id |
  | last_reply_at | Date | Date.now | 上次回复时间 |
  | content_is_html | Boolean |  | 内容是否是html |
  | tab | String |  | tab 类型 |
  | deleted | Boolean | false | 是否是删除贴 |

topic_collect 表

  | field | type | default | detail |
  | ------ | ------ |---| -- |
  | user_id | ObjectId |  | 用户id |
  | topic_id | ObjectId |  | 主题id |
  | create_at | Date | Date.now | 创建时间 |

message 表

  | field | type | default | detail |
  | ------ | ------ |---| -- |
  | type | String |  | 消息类型 |
  | master_id | ObjectId |  | masterid |
  | author_id | ObjectId |  | 作者id |
  | topic_id | ObjectId | false | 主题id |
  | reply_id | ObjectId | false | 回复id |
  | has_read | Boolean | false | 是否已读 |
  | create_at | Date | Date.now | 创建时间 |

reply 表

  | field | type | default | detail |
  | ------ | ------ |---| -- |
  | content | String |  | 内容 |
  | author_id | ObjectId |  | 作者id |
  | topic_id | ObjectId | false | 主题id |
  | reply_id | ObjectId | false | 回复id |
  | create_at | Date | Date.now | 创建时间 |
  | update_at | Date | Date.now | 更新时间 |
  | content_is_html | Boolean |  | 内容是否是html |
  | ups | [ Schema.Types.ObjectId ] |  | 点赞列表 |
  | deleted | Boolean | false | 是否删除 |

user 表

  | field | type | default | detail |
  | ------ | ------ |---| -- |
  | name | String |  | 用户名 |
  | loginname | String |  | 登录名 |
  | pass | String |  | 密码 |
  | email | String |  | 邮箱 |
  | url | String |  |  |
  | profile_image_url | String |  | 头像地址 |
  | location | String |  | 地址 |
  | signature | String |  | 签名 |
  | profile | String |  |  |
  | weibo | String |  | 微博 |
  | avatar | String |  | 头像 |
  | githubId | String |  | githubid |
  | githubUsername | String |  | github 用户名 |
  | githubAccessToken | String |  | github token |
  | is_block | Boolean | false | 黑名单 |
  | score | Number | 0 | 分数 |
  | topic_count | Number | 0 | 创建主题数 |
  | reply_count | Number | 0 | 回复数 |
  | follower_count | Number | 0 | 被关注数 |
  | following_count | Number | 0 | 关注数 |
  | create_at | Date | Date.now | 创建时间 |
  | update_at | Date | Date.now | 更新时间 |
  | is_star | Boolean | 0 | 被star |
  | level | Number | 0 | 等级 |
  | active | Boolean | false | 激活 |
  | receive_reply_mail | Boolean | false |  |
  | receive_at_mail | Boolean | false |  |
  | from_wp | Boolean |  | 是否来自 windows phone |
  | retrieve_time | Number |  |  |
  | retrieve_key | String |  |  |
  | accessToken | String | | accesstoken |

### 提供服务

1. 根据上面的表结构，建立 mongodb 数据模型（需要了解 mongodb， mongoose）
2. 后端需要提供类似 sql 查询的服务
3. 登陆态的控制
4. 路由控制

## 前端设计分析

- 使用 [egg](https://eggjs.org/zh-cn/intro/quickstart.html) 全局命令初始化项目, 生成下面的目录的结构

```js
egg-example
├── package.json
├── app.js (可选)
├── app
|   ├── router.js
│   ├── controller
│   |   └── home.js
│   ├── service (可选)
│   |   └── user.js
│   ├── middleware (可选)
│   |   └── response_time.js
│   ├── public (可选)
│   |   └── reset.css
│   ├── view (可选)
│   |   └── home.tpl
│   └── extend (可选)
│       ├── helper.js (可选)
│       ├── request.js (可选)
│       ├── response.js (可选)
│       ├── context.js (可选)
│       ├── application.js (可选)
│       └── agent.js (可选)
├── config
|   ├── plugin.js
|   ├── config.default.js
│   ├── config.prod.js
|   ├── config.test.js (可选)
|   ├── config.local.js (可选)
└── test
    ├── middleware
    |   └── response_time.test.js
    └── controller
        └── home.test.js
```

- 配置

```js

安装 egg-view-ejs egg-mongoose 这两个模块， 并在 config.default.js 做好基本配置

'use strict';

module.exports = appInfo => {
  const config = {};
  // key
  config.keys = appInfo.name + '_1519887194138_3450';
  // view
  config.view = {
    defaultViewEngine: 'ejs',
    mapping: {
      '.html': 'ejs', // 映射
    },
  };
  config.ejs = {
    layout: 'layout.html', // view layout.html 作为默认首页
  };
  // database
  config.mongoose = {
    url: process.env.EGG_MONGODB_URL || 'mongodb://127.0.0.1:27017/egg_example',
    options: {
      server: { poolSize: 20 },
    },
  };

  return config;
};

- 静态资源存放

app/public

- 开发页面

[根据指南](https://eggjs.org/zh-cn/core/view.html) 编写 controller 和 view

```

## 需要考虑的问题

1. 后端还需要设计路由，不同的路由进来，应该展示不同的内容，并且有权限控制（如未登陆不能发表评论和发帖）
2. 提供给管理员一些权限，能删除一些帖子和屏蔽不合法用户

## 网站路由

1. /signin 登录  用户名 + 密码
2. /signup 注册
3. /search_pass 忘记密码
4. /index 首页 用户不登录无法点赞 评论 tab good all share job dev
5. /about 关于
6. /getstart 静态页面
7. /api 介绍 /api/* 提供向外部提供接口服务
8. /users/100 积分 top 100
9. /user/name 用户主页
10. /topic:id 主题详情
11. /topic/create 创建主题

分析 [egg-cnode](https://github.com/cnodejs/egg-cnode)
