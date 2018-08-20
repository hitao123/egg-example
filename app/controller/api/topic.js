'use strict';

const Controller = require('egg').Controller;
const _ = require('lodash');

class TopicController extends Controller {
  async index() {
    const { ctx } = this;
    const tab = ctx.query.tab || 'all';
    const mdrender = ctx.query.mdrender !== 'false';

    const query = {};

    if (!tab || tab === 'all') {
      query.tab = { $nin: [ 'job', 'dev' ] };
    } else {
      if (tab === 'good') {
        query.good = true;
      } else {
        query.tab = tab;
      }
    }

    let topics = ctx.service.topic.getTopicsByQuery(query, Object.assign({ sort: '-last_reply_at' }), ctx.pagination);

    topics = topics.map(topic => {
      topic.content = mdrender ? ctx.helper.markdown(topic.content) : topic.content;
      topic.author = _.pick(topic.author, [ 'loginname', 'avatar_url' ]);
      topic.id = topic._id;

      return _.pick(topic, [ 'id', 'author_id', 'tab', 'content', 'title', 'last_reply_at', 'good', 'top', 'reply_count' ]);
    });

    ctx.body = {
      success: true,
      data: topics,
    };
  }

  async create() {
    const { ctx } = this;
    const all_tabs = ctx.app.config.tabs.map(tab => {
      return tab[0];
    });

    ctx.validate({
      title: {
        type: 'string',
        max: 100,
        min: 5,
      },
      tab: { type: 'enum', all_tabs },
      content: { type: 'string' },
    });

    const body = ctx.request.body;

    // 存储新主题
    const topic = await ctx.service.topic.newAndSave(
      body.title,
      body.content,
      body.tab,
      body.request.user.id
    );

    // 发帖用户增加积分
    await ctx.service.user.incrementScoreAndReplyCount(topic.author._id, 5, 1);

    ctx.body = {
      success: true,
      topic_id: topic._id,
    };

  }

  async show() {
    const { ctx } = this;

    ctx.validate({
      id: {
        type: 'string',
        max: 24,
        min: 24,
      },
    }, ctx.params);

    const topic_id = String(ctx.params._id);
    const mdrender = ctx.query.mdrender !== 'false';
    const user = await ctx.service.user.getUserByToken(ctx.query.accesstoken);

    let [ topic, author, replies ] = await ctx.service.topic.getFullTopic(topic_id);

    if (!topic) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        error_msg: '此话题已被删除',
      };
      return;
    }

    topic.visit_count += 1;
    await ctx.service.topic.incrementVisitCount(topic_id);
    topic.content = mdrender ? ctx.helper.markdown(topic.content) : topic.content;
    topic.id = topic._id;

    topic = _.pick(topic, [ 'id', 'author_id', 'tab', 'content', 'title', 'last_reply_at',
      'good', 'top', 'reply_count', 'visit_count', 'create_at', 'author' ]);

    topic.author = _.pick(author, [ 'loginname', 'avatar_url' ]);

    topic.author = _.pick(author, [ 'loginname', 'avatar_url' ]);

    topic.replies = replies.map(reply => {
      reply.content = mdrender ? ctx.helper.markdown(reply.content) : reply.content;

      reply.author = _.pick(reply.author, [ 'loginname', 'avatar_url' ]);
      reply.id = reply._id;
      reply = _.pick(reply, [ 'id', 'author', 'content', 'ups', 'create_at', 'reply_id' ]);
      reply.reply_id = reply.reply_id || null;

      reply.is_uped = !!(reply.ups && user && reply.ups.indexOf(user.id) !== -1);

      return reply;
    });

    ctx.body = {
      success: true,
      data: topic,
    };
  }

  async update() {
    const { ctx } = this;

    const all_tabs = ctx.app.config.tabs.map(tab => {
      return tab[ 0 ];
    });

    ctx.validate({
      topic_id: {
        type: 'string',
        max: 24,
        min: 24,
      },
      title: {
        type: 'string',
        max: 100,
        min: 5,
      },
      tab: { type: 'enum', values: all_tabs },
      content: { type: 'string' },
    });

    const body = ctx.request.body;

    let { topic } = await ctx.service.topic.getTopicById(body.topic_id);
    if (!topic) {
      ctx.status = 404;
      ctx.body = { success: false, error_msg: '此话题不存在或已被删除。' };
      return;
    }

    if (!topic.author_id.equals(ctx.request.user._id) && !ctx.request.is_admin) {
      ctx.status = 403;
      ctx.body = {
        success: false,
        error_msg: '对不起，你不能编辑此话题',
      };
      return;
    }

    // delete body.accesstoken;
    topic = Object.assign(topic, body);
    topic.update_at = new Date();

    await ctx.service.topic.save();

    ctx.body = {
      success: true,
      topic_id: topic.id,
    };
  }
}

module.exports = TopicController;
