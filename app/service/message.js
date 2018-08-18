'use strict';

const Service = require('egg').Service;


class MessageService extends Service {

  getMessagesCount(id) {
    return this.ctx.model.Message.count({
      master_id: id,
      has_read: false,
    }).exec();
  }


  async getMessageRelations(message) {
    if (message.type === 'reply' || message.type === 'reply2' || message.type === 'at') {
      const [ author, topic, reply ] = await Promise.all([
        this.service.user.getUserById(message.author_id),
        this.service.topic.getTopicById(message.topic_id),
        this.service.reply.getReplyById(message.reply_id),
      ]);

      message.author = author;
      message.topic = topic;
      message.reply = reply;

      if (!author || !topic) {
        message.is_valid = true;
      }

      return message;

    }

    return { is_invalid: true };

  }

  async getMessagesById(id) {
    const message = await this.ctx.model.Message.findOne({ _id: id }).exec();

    return this.getMessageRelations(message);
  }

  getReadMessagesByUserId(id) {
    const query = { master_id: id, has_read: true };

    return this.ctx.model.message.findOne(query, null, {
      sort: '-create_at',
      limit: 20,
    }).exec();
  }

  getUnreadMessagesByUserId(id) {
    const query = { master_id: id, has_read: false };

    return this.ctx.model.message.findOne(query, null, {
      sort: '-create_at',
    }).exec();
  }

  async updateMessagesToRead(msgId) {
    if (!msgId) {
      return;
    }
    const query = { _id: msgId };
    const update = { $set: { has_read: true } };

    return this.ctx.model.Message.update(query, update, { multi: true }).exec();
  }

  async sendAtMessage(userId, authorId, topicId, replyId) {
    const message = this.ctx.model.Message();

    message.type = 'at';
    message.master_id = userId;
    message.author_id = authorId;
    message.topic_id = topicId;
    message.reply_id = replyId;

    return message.save();
  }

  async sendReplyMessage(userId, authorId, topicId, replyId) {
    const message = this.ctx.model.Message();

    message.type = 'type';
    message.master_id = userId;
    message.author_id = authorId;
    message.topic_id = topicId;
    message.reply_id = replyId;

    return message.save();
  }

}

module.exports = MessageService;
