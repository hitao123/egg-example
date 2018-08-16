'use strict';

const Service = require('egg').Service;

// Redis 是一个基于内存的键（key）值（value）类型的数据结构存储容器，它既可以完全工作在内存中，也可以持久化存储。
// 当 Redis 工作于持久化模式时，可以将它当作一个非关系型数据库使用。而工作于内存中时，则可以用作数据的高速缓存。
// 不过和普通的键值结构缓存不同是：Redis 的值可以拥有种类繁多并且灵活的内建数据结构。这些数据结构具有及其高效的增删改查时间复杂度，
// 在能够满足更多业务场景的数据存储需求同时还提供极为快速的处理速度

class CacheService extends Service {
  async get(key) {
    const { redis, logger } = this.app;
    const t = Date.now();
    let data = await redis.get(key);
    if (!data) return;
    data = JSON.parse(data);
    const duration = (Date.now() - t);
    logger.debug('Cache', 'get', key, (duration + 'ms').green);
    return data;
  }

  async setex(key, value, seconds) {
    const { redis, logger } = this.app;
    const t = Date.now();
    value = JSON.stringify(value);
    await redis.set(key, value, 'EX', seconds);
    const duration = (Date.now() - t);
    logger.debug('Cache', 'set', key, (duration + 'ms').green);
  }

  async incr(key, seconds) {
    const { redis, logger } = this.app;
    const t = Date.now();
    const result = await redis.multi().incr(key).expire(key, seconds)
      .exec();
    const duration = (Date.now() - t);
    logger.debug('Cache', 'set', key, (duration + 'ms').green);
    return result[0][1];
  }
}

module.exports = CacheService;
