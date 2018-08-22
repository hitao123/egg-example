'use strict';

exports.ejs = {
  enable: true,
  package: 'egg-view-ejs',
};

exports.redis = {
  enable: true,
  package: 'egg-redis',
};

exports.mongoose = {
  enable: true,
  package: 'egg-mongoose',
};

exports.passport = {
  enable: true,
  package: 'egg-passport',
};

exports.passportGithub = {
  enable: true,
  package: 'egg-passport-github',
};

exports.passportLocal = {
  enable: true,
  package: 'egg-passport-local',
};

exports.validate = {
  enable: true,
  package: 'egg-validate',
};

// api 层 默认加 /api/v1 前缀
// const apiV1Router = app.router.namespace('/api/v1');

exports.routerPlus = {
  enable: true,
  package: 'egg-router-plus',
};
