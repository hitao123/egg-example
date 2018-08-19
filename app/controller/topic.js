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
    function isUped(user, reply) {
      if (!reply.ups) {
        return false;
      }
      return reply.ups.indexOf(user._id) !== -1;
    }
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

    // 点赞数排名第三的回答，它的点赞数就是阈值  没太明白？
    topic.reply_up_threshold = (() => {
      let allUpCount = replies.map(reply => {
        return (reply.ups && reply.ups.length) || 0;
      });
      allUpCount = _.sortBy(allUpCount, Number).reverse();

      let threshold = allUpCount[2] || 0;
      if (threshold < 3) {
        threshold = 3;
      }
      return threshold;
    })();

    const options = { limit: 5, sort: '-last_reply_at' };
    const query = { author_id: topic.author_id, _id: { $nin: [ topic._id ] } };
    const other_topics = await service.topic.getTopicsByQuery(query, options);

    // get no_reply_topics
    let no_reply_topics = await service.cache.get('no_reply_topics');
    if (!no_reply_topics) {
      const query = { reply_count: 0, tab: { $nin: [ 'job', 'dev' ] } };
      const options = { limit: 5, sort: '-create_at' };
      no_reply_topics = await service.topic.getTopicsByQuery(query, options);
      await service.cache.setex('no_reply_topics', no_reply_topics, 60 * 1);
    }

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
    ctx.logger.warn('tabs', config.tabs);
    await ctx.render('topic/edit', {
      tabs: config.tabs,
    });
  }

  async put() {
    const { ctx, service } = this;
    const { tabs } = this.config;
    const { body } = ctx.request;

    // 得到所有的 tab, e.g. ['ask', 'share', ..]
    const allTabs = tabs.map(tPair => tPair[0]);

    const RULE_CREATE = {
      title: {
        type: 'string',
        max: 100,
        min: 5,
      },
      content: {
        type: 'string',
      },
      tab: {
        type: 'enum',
        values: allTabs,
      },
    };
    ctx.validate(RULE_CREATE, ctx.request.body);

    // 储存新主题帖
    const topic = await service.topic.newAndSave(
      body.title,
      body.content,
      body.tab,
      ctx.user._id
    );

    ctx.redirect('/topic/' + topic._id);
  }

  async showEdit() {
    const { ctx, service, config } = this;
    const topic_id = ctx.params.tid;
    ctx.logger.debug('tabs', config.tabs);
    const { topic } = await service.topic.getTopicById(topic_id);

    if (!topic) {
      ctx.status = 404;
      ctx.message = '此话题不存在或已被删除。';
      return;
    }

    if (String(topic.author_id) === String(ctx.user._id) || ctx.user.is_admin) {

      await ctx.render('topic/edit', {
        action: 'edit',
        topic_id: topic._id,
        title: topic.title,
        content: topic.content,
        tab: topic.tab,
        tabs: config.tabs,
      });
    } else {
      ctx.status = 403;
      ctx.message = '对不起，你不能编辑此话题';
    }
  }

  async update() {
    const { ctx, service, config } = this;

    const topic_id = ctx.params.tid;
    let { title, tab, content } = ctx.request.body;

    const { topic } = await service.topic.getTopicById(topic_id);
    if (!topic) {
      ctx.status = 404;
      ctx.message = '此话题不存在或已被删除。';
      return;
    }

    if (String(topic.author_id) === String(ctx.user._id) || ctx.user.is_admin) {
      title = title.trim();
      tab = tab.trim();
      content = content.trim();

      // 验证
      let editError;
      if (title === '') {
        editError = '标题不能是空的。';
      } else if (title.length < 5 || title.length > 100) {
        editError = '标题字数太多或太少。';
      } else if (!tab) {
        editError = '必须选择一个版块。';
      } else if (content === '') {
        editError = '内容不可为空。';
      }

      if (editError) {
        await ctx.render('topic/edit', {
          action: 'edit',
          edit_error: editError,
          topic_id: topic._id,
          content,
          tabs: config.tabs,
        });
        return;
      }

      // 保存话题
      topic.title = title;
      topic.content = content;
      topic.tab = tab;
      topic.update_at = new Date();

      await topic.save();

      ctx.redirect('/topic/' + topic._id);

    } else {
      ctx.status = 403;
      ctx.message = '对不起，你不能编辑此话题';
    }
  }

  async delete() {
    // 删除话题, 话题作者topic_count减1
    // 删除回复，回复作者reply_count减1
    // 删除topic_collect，用户collect_topic_count减1
    const { ctx, service } = this;
    const topic_id = ctx.params.tid;

    const [ topic, author ] = await service.topic.getFullTopic(topic_id);

    if (!topic) {
      ctx.status = 422;
      ctx.body = { message: '此话题不存在或已被删除。', success: false };
      return;
    }

    if (!ctx.user.is_admin && !topic.author_id.equals(ctx.user._id)) {
      ctx.status = 403;
      ctx.body = { message: '无权限', success: false };
      return;
    }

    author.score -= 5;
    author.topic_count -= 1;
    await author.save();

    topic.deleted = true;

    await topic.save();

    ctx.body = { message: '话题已被删除。', success: true };
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
