'use strict';

const Controller = require('egg').Controller;
const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const uuidv1 = require('uuid/v1');


class TopicController extends Controller {
  /**
   * Topic
   */

  async index() {
    const { ctx, service } = this;
    const topic_id = ctx.params.tid;
    const currentUser = ctx.user;

    if (topic_id.length !== 24) {
      ctx.status = 404;
      ctx.message = '此话题不存在或者已经被删除';
      return;
    }

    const [ topic, author, replies ] = await service.topic.getFullTopic(topic_id);

    if (!topic) {
      ctx.status = 404;
      ctx.message = '此话题不存在或者已经被删除';
      return;
    }

    await ctx.render('topic/index', {
      topic,
    });
  }
  /**
   * 创建主题
   */

  async create() {
    const { ctx, config } = this;
    await ctx.render('topic/edit', {
      tab: config.tabs,
    });
  }
}

module.exports = TopicController;
