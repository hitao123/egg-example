# 学习 eggjs框架 开发nodejs项目

## 后端结构分析

> user topic 表是最重要的，reply topic_collect message 都是以前两张表相关的，每张表都有一个主键如 `"_id" : ObjectId("5b0ab2b091a9e80aa9177318")`

### topic 表

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

## 前端展示分析

## 需要考虑的问题

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
