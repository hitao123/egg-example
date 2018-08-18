'use strict';

const Controller = require('egg').Controller;
const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const uuidv1 = require('uuid/v1');
const awaitWriteStream = require('await-stream-ready').write;
const sendToWormhole = require('stream-wormhole');


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

    topic.visit_count += 1;
    await service.topic.incrementVisitCount(topic_id);

    topic.author = author;
    topic.replies = replies;

    let is_collect;
    if (!currentUser) {
      is_collect = null;
    } else {
      is_collect = await service.topicCollect.getTopicCollect(
        currentUser._id,
        topic_id
      );
    }

    await ctx.render('topic/index', {
      topic,
      author_other_topics: other_topics,
      no_reply_topics,
      is_uped: isUped,
      is_collect,
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

  async put() {

  }

  async showEdit() {

  }

  async update() {

  }

  async delete() {

  }

  async top() {
    const { ctx, service } = this;
    const topic_id = ctx.params.tid;
    const referer = ctx.get('referer');

    const topic = await service.topic.getTopic(topic_id);

    if (!topic) {
      ctx.status = 404;
      ctx.message = '此话题不存在或已被删除。';
      return;
    }
    topic.top = !topic.top;
    await topic.save();
    const msg = topic.top ? '此话题已置顶。' : '此话题已取消置顶。';
    await ctx.render('notify/notify', { success: msg, referer });
  }

  async good() {
    const { ctx, service } = this;
    const topic_id = ctx.params.tid;
    const referer = ctx.get('referer');

    const topic = await service.topic.getTopic(topic_id);
    if (!topic) {
      ctx.status = 404;
      ctx.message = '此话题不存在或已被删除。';
      return;
    }
    topic.good = !topic.good;
    await topic.save();
    const msg = topic.good ? '此话题已加精。' : '此话题已取消加精。';
    await ctx.render('notify/notify', { success: msg, referer });
  }

  async lock() {
    const { ctx, service } = this;
    const topic_id = ctx.params.tid;
    const referer = ctx.get('referer');

    const topic = await service.topic.getTopic(topic_id);
    if (!topic) {
      ctx.status = 404;
      ctx.message = '此话题不存在或已被删除。';
      return;
    }
    topic.lock = !topic.lock;
    await topic.save();
    const msg = topic.lock ? '此话题已锁定。' : '此话题已取消锁定。';
    await ctx.render('notify/notify', { success: msg, referer });
  }

  async collect() {
    const { ctx, service } = this;
    const topic_id = ctx.request.body.topic_id;

    const topic = await service.topic.getTopic(topic_id);

    if (!topic) {
      ctx.body = { status: 'failed' };
      return;
    }

    const doc = await service.topicCollect.getTopicCollect(
      ctx.user._id,
      topic._id
    );

    if (doc) {
      ctx.body = { status: 'failed' };
      return;
    }

    await service.topicCollect.newAndSave(ctx.user._id, topic._id);
    ctx.body = { status: 'success' };

    await Promise.all([
      service.user.incrementCollectTopicCount(ctx.user._id),
      service.topic.incrementCollectCount(topic_id),
    ]);
  }

  async de_collect() {
    const { ctx, service } = this;
    const topic_id = ctx.request.body.topic_id;
    const topic = await service.topic.getTopic(topic_id);

    if (!topic) {
      ctx.body = { status: 'failed' };
      return;
    }

    const removeResult = await service.topicCollect.remove(
      ctx.user._id,
      topic._id
    );

    if (removeResult.result.n === 0) {
      ctx.body = { status: 'failed' };
      return;
    }

    const user = await service.user.getUserById(ctx.user._id);

    user.collect_topic_count -= 1;
    // ctx.user = user;
    await user.save();

    topic.collect_count -= 1;
    await topic.save();

    ctx.body = { status: 'success' };
  }

  async upload() {
    const { ctx, config } = this;
    const uid = uuidv1();
    const stream = await ctx.getFileStream();
    const filename = uid + path.extname(stream.filename).toLowerCase();
    const target = path.join(config.upload.path, filename);
    const writeStream = fs.createWriteStream(target);

    try {
      await awaitWriteStream(stream.pipe(writeStream));
      ctx.body = {
        success: true,
        url: config.upload.url + filename,
      };
    } catch (err) {
      await sendToWormhole(stream);
      throw err;
    }
  }
}

module.exports = TopicController;
