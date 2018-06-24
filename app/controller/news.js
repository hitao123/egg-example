'use strict';

const Controller = require('egg').Controller;

class NewsController extends Controller {
  async list() {
    const config = this.config;
    const ctx = this.ctx;
    const page = ctx.query.page || 1;
    const newsList = await ctx.service.news.list(page);
    await ctx.render('news/list.html', { list: newsList, config });
  }
}

module.exports = NewsController;
