'use strict';

const Service = require('egg').Service;

class ReplyService extends Service {
  /*
   * 获取一条回复信息
   * @param {String} id 回复ID
   * @return {Promise[reply]} 承载 replay 的 Promise 对象
   */
  getReply(id) {
    return this.ctx.model.Reply.findOne({ _id: id }).exec();
  }
  /**
   * 根据回复id， 获取回复
   * @param {*} id
   */

  async getReplyById(id) {
    if (!id) {
      return null;
    }

    const reply = await this.ctx.model.Reply.findOne({ _id: id }).exec();

    if (!reply) {
      return null;
    }

    const auther_id = reply.auther_id;
    const author = await this.service.user.getUserById(auther_id);

    reply.author = author;

    if (reply.content_is_html) {
      return reply;
    }

    return reply;
  }
  /*
   * 根据主题ID，获取回复列表
   * @param {String} id 主题ID
   * @return {Promise[replies]} 承载 replay 列表的 Promise 对象
   */
  async getRepliesByTopicId(id) {
    const query = { topic_id: id, deleted: false };
    let replies = await this.ctx.model.Reply.find(query, '', { sort: 'create_at' }).exec();

    if (replies.length === 0) {
      return [];
    }

    replies = replies.filter(item => {
      return !item.content_is_html;
    });

    return Promise.all(replies.map(async item => {
      const author = await this.service.user.getUserById(item.auther_id);

      item.author = author || { _id: '' };

      return item;
    })
    );
  }
  /**
   * 创建并保存一条回复信息
   * @param {*} content 回复内容
   * @param {*} topicId 主题ID
   * @param {*} authorId 回复作者id
   * @param {*} replyId 回复ID
   * @return 承载 replay 列表的 Promise 对象
   */

  async newAndSave(content, topicId, authorId, replyId = null) {
    const reply = new this.ctx.model.Reply();

    reply.content = content;
    reply.topic_id = topicId;
    reply.author_id = authorId;

    if (replyId) {
      reply.reply_id = replyId;
    }

    await reply.save();
    return reply;
  }

  getLastReplyByTopicId(topicId) {
    const query = { topic_id: topicId, deleted: false };
    const opts = { sort: { create_at: -1 }, limit: 1 };
    return this.ctx.model.Reply.findOne(query, '_id', opts).exec();
  }

  getRepliesByAuthorId(authorId, opts = null) {
    return this.ctx.model.Reply.find({ auther_id: authorId }, '_id', opts).exec();
  }

  getCountByAuthorId(authorId) {
    return this.ctx.model.Reply.count({ author_id: authorId }).exec();
  }
}

module.exports = ReplyService;
