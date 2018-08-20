'use strict';

module.exports = () => {
  return async (ctx, next) => {
    if (!ctx.pagination) {
      const query = ctx.query;
      const config = ctx.app.config; // 这里为什么在 app里？

      const pagination = {};

      pagination.limit = Math.min(100, parseInt(query.limit || 10, 10));
      const page = Math.max(1, parseInt(query.page || config.default_page, 10));
      pagination.skip = (page - 1) * page.limit;

      ctx.pagination = pagination;

      await next();


    }
  };
};
