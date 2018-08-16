'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const ObjectId = Schema.ObjectId;

  const TopicSchema = new Schema({
    title: { type: String },
    content: { type: String },
    author_id: { type: ObjectId }, // user _id 类似 "_id" : ObjectId("5b0ab2b091a9e80aa9177318") user表 外键
    top: { type: Boolean, default: false }, // 置顶帖
    good: { type: Boolean, default: false }, // 精华帖
    lock: { type: Boolean, default: false }, // 被锁定主题
    reply_count: { type: Number, default: 0 },
    visit_count: { type: Number, default: 0 },
    collect_count: { type: Number, default: 0 },
    create_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now },
    last_reply: { type: ObjectId },
    last_reply_at: { type: Date, default: Date.now },
    content_is_html: { type: Boolean },
    tab: { type: String },
    deleted: { type: Boolean, default: false },
  });

  TopicSchema.index({ create_at: -1 });
  TopicSchema.index({ top: -1, last_reply_at: -1 });
  TopicSchema.index({ author_id: 1, create_at: -1 });

  return mongoose.model('Topic', TopicSchema);
};
