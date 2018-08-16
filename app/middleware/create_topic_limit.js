'use strict';

const moment = require('moment');

module.exports = (perDayPerUserLimitCount = 10) => {

  return async function createTopicLimit(ctx, next) {
    const { user, service } = ctx;
    const YYYYMMDD = moment.format('YYYYMMDD');
    const key = `topics_count_${user._id}_${YYYYMMDD}`;

    let todaysTopicsCount = (await service.cache.get(key)) || 0;
    if (todaysTopicsCount >= perDayPerUserLimitCount) {
      ctx.status = 403;
      await ctx.render('notify/notify', { error: `今天发布主题到达上限${perDayPerUserLimitCount}` });
      return;
    }

    await next();

    if (ctx.status === 302) {
      todaysTopicsCount += 1;
      await service.cache.incr(key, 60 * 60 * 24);
      ctx.set('X-RateLimit-Limit', perDayPerUserLimitCount);
      ctx.set('X-RateLimit-Remaining', perDayPerUserLimitCount - todaysTopicsCount);
    }
  };
};
