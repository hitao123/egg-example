'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const ObjectId = Schema.ObjectId;

  const TopicCollectSchema = new Schema({
    user_id: { type: ObjectId }, // 关联 user _id 外键
    topic_id: { type: ObjectId }, // 关联 topic _id 外键
    create_at: { type: Date, default: Date.now }, // 创建时间
  });

  TopicCollectSchema.index({ user_id: 1, topic_id: 1 }, { unique: true });

  return mongoose.model('TopicCollect', TopicCollectSchema);
};
