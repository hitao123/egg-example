'use strict';

const utility = require('utility');

module.exports = app => {

  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  // 这里是不是就创建了 collection
  const UserSchema = new Schema({
    name: { type: String },
    loginname: { type: String }, // 登录名
    pass: { type: String }, // 密码
    email: { type: String }, // 邮箱
    url: { type: String },
    profile_image_url: { type: String },
    location: { type: String },
    signature: { type: String },
    profile: { type: String },
    weibo: { type: String },
    avatar: { type: String },
    githubId: { type: String },
    githubUsername: { type: String }, // github username
    githubAccessToken: { type: String },
    is_block: { type: Boolean, default: false },

    score: { type: Number, default: 0 },
    topic_count: { type: Number, default: 0 },
    reply_count: { type: Number, default: 0 },
    follower_count: { type: Number, default: 0 },
    following_count: { type: Number, default: 0 },
    collect_tag_count: { type: Number, default: 0 },
    collect_topic_count: { type: Number, default: 0 },
    create_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now },
    is_star: { type: Boolean },
    level: { type: String },
    active: { type: Boolean, default: false },

    receive_reply_mail: { type: Boolean, default: false },
    receive_at_mail: { type: Boolean, default: false },
    from_wp: { type: Boolean },

    retrieve_time: { type: Number },
    retrieve_key: { type: String },

    accessToken: { type: String },
  });
  // http://mongoosejs.com/docs/api.html#schema_Schema-index 创建索引
  UserSchema.index({ loginname: 1 }, { unique: true }); // 主键
  UserSchema.index({ email: 1 }, { unique: true }); // 主键
  UserSchema.index({ score: -1 });
  UserSchema.index({ githubId: 1 });
  UserSchema.index({ accessToken: 1 });

  UserSchema.virtual('avatar_url').get(function() {
    let url =
      this.avatar ||
      'https://gravatar.com/avatar/' +
        utility.md5(this.email.toLowerCase()) +
        '?size=48';

    // www.gravatar.com 被墙
    url = url.replace('www.gravatar.com', 'gravatar.com');

    // 让协议自适应 protocol，使用 `//` 开头
    if (url.indexOf('http:') === 0) {
      url = url.slice(5);
    }

    // 如果是 github 的头像，则限制大小
    if (url.indexOf('githubusercontent') !== -1) {
      url += '&s=120';
    }

    return url;
  });
  // 不会持久化保存
  UserSchema.virtual('isAdvanced').get(function() {
    // 积分高于 700 则认为是高级用户
    return this.score > 700 || this.is_star;
  });
  // 中间件
  UserSchema.pre('save', function(next) {
    const now = new Date();
    this.update_at = now;
    next();
  });

  return mongoose.model('User', UserSchema);
};
