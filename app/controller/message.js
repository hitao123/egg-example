'use strict';

const Controller = require('egg').Controller;

class MessageController extends Controller {
  async index() {
    const { ctx } = this;
    const userId = ctx.user._id;
    const msgService = ctx.service.message;
    const [ readMessageResults, unReadMessageResults ] = await Promise.all([
      msgService.getReadMessageByUserId(userId),
      msgService.getUnReadMessageByUserId(userId),
    ]);

    const hasReadMessages = await Promise.all(readMessageResults.map(async message => await msgService.getMessageRelations(message)));
    const hasUnReadMessages = await Promise.all(unReadMessageResults.map(async message => await msgService.getMessageRelations(message)));

    await msgService.updateMessagesToRead(userId, unReadMessageResults);
    await ctx.render('message/index.html', { has_read_messages: hasReadMessages, hasnot_read_messages: hasUnReadMessages });

  }
}

module.exports = MessageController;
