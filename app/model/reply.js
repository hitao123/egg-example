'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const ObjectId = Schema.ObjectId;

  const ReplySchema = new Schema({
    content: { type: String },
    topic_id: { type: ObjectId }, // topic _id 外键
    author_id: { type: ObjectId }, // user _id 外键
    reply_id: { type: ObjectId }, // reply _id 主键
    create_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now },
    content_is_html: { type: Boolean },
    ups: [ Schema.Types.ObjectId ], // ObjectId 数组
    deleted: { type: Boolean, default: false },
  }, {
    usePushEach: true,
  });
  // myArray = myArray.concat([myObject]);
  // https://github.com/Automattic/mongoose/issues/4455 可能和这个有关
  ReplySchema.index({ topic_id: 1 });
  ReplySchema.index({ author_id: 1, create_at: -1 });

  return mongoose.model('Reply', ReplySchema);
};
