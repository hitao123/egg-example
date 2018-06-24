'use strict';

const moment = require('moment');
const xmlbuilder = require('xmlbuilder');
const Controller = require('egg').Controller;

class HomeController extends Controller {

  async index() {

    let page = parseInt(this.ctx.query.page, 10) || 1;
    page = page > 0 ? page : 1;
    const tab = this.ctx.query.tab || 'all';

    const limit = this.config.list_topic_count;
    const tabName = this.ctx.helper.tabName(tab);

    const locals = {
      topics,
      current_page: page,
      list_topic_count: limit,
      tops,
      no_reply_topics,
      pages,
      tabs: this.config.tabs,
      tab,
      pageTitle: tabName && tabName + '版块',
    };

    await this.ctx.render('index', locals);
  }

  async sitemap() {
    const urlset = xmlbuilder.create('urlset', {
      version: '1.0', encoding: 'UTF-8',
    });
    urlset.att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');

    let sitemapData = await this.service.cache.get('sitemap');
    if (!sitemapData) {
      const topics = await this.service.topic.getLimit5w();
      topics.forEach(topic => {
        urlset.ele('url').ele('loc', 'http://cnodejs.org/topic/' + topic._id);
      });
      sitemapData = urlset.end();
      // 缓存一天
      await this.service.cache.setex('sitemap', sitemapData, 3600 * 24);
    }

    this.ctx.type = 'xml';
    this.ctx.body = sitemapData;
  }

  async appDownload() {
    this.ctx.redirect('https://github.com/soliury/noder-react-native/blob/master/README.md');
  }
}

module.exports = HomeController;
