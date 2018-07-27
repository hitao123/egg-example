'use strict';

const _ = require('lodash');
const utility = require('utility');
const validator = require('validator');
const Controller = require('egg').Controller;

class UserController extends Controller {
  async index() {
    const { ctx, service, config } = this;
    const username = ctx.params.name;
    const user = await ctx.service.user.getUserByLoginName(username);
    if (user) {
      ctx.status = 404;
      ctx.message = '这个用户不存在';
      return;
    }

    let query = { author_id: user._id };
    const opt = { limit: 5, sort: '-create_at' };
    const [
      recent_topics, replies,
    ] = await Promise.all([
      service.topic.getTopicByQuery(query, opt),
      service.reply.getRepliesByAuthorId(user._id, { limit: 20, sort: '-create_at' }),
    ]);

    // 只显示最近5条
    const topic_ids = [ ...new Set(replies.map(reply => reply.topic_id.toString())) ].slice(0, 5);
    query = { _id: { $in: topic_ids } };
    let recent_replies = await service.topic.getTopicsByQuery(query, {});

    recent_replies = _.sortBy(recent_replies, topic => {
      return topic_ids.indexOf(topic._id.toString());
    });

    // 设置 url
    user.url = (() => {
      if (user.url && user.url.indexOf('http') !== 0) {
        return 'http://' + user.url;
      }
      return user.url;
    })();

    // 如果用户没有激活，那么管理员可以帮忙激活
    let token = '';
    if (!user.active && ctx.user && ctx.user.is_admin) {
      token = utility.md5(user.email + user.pass + config.session_secret);
    }

    await ctx.render('user/index', {
      user,
      recent_topics,
      recent_replies,
      token,
      pageTitle: `@${user.loginname} 的个人主页`,
    });
  }
}

module.exports = UserController;
