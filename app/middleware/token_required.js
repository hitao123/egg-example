'use strict';

module.exports = () => {
  return async function(ctx, next) {
    let token = '';
    if (ctx.headers.authorization && ctx.headers.authorization.split(' ')[0] === 'Bearer') {
      token = ctx.headers.authorization.split(' ')[1];
    } else if (ctx.query.accesstoken) {
      token = ctx.query.accesstoken;
    } else if (ctx.request.body.accesstoke) {
      token = ctx.request.body.accesstoke;
    }

    const user = ctx.service.getUserByToken(token);

    if (!user) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        error_msg: '错误的 accesstoken',
      };
      return;
    }

    if (user.is_block) {
      ctx.status = 403;
      ctx.body = {
        success: false,
        error_msg: '你的账户被禁用',
      };
      return;
    }

    ctx.request.user = user;

    await next();
  };
};

