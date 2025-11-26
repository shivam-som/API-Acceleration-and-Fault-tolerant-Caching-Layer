const IORedis = require('ioredis');
const { REDIS_URL } = require('../config');

let redis;
function createClient() {
  if (redis) return redis;
  try {
    redis = new IORedis(REDIS_URL, { lazyConnect: true, connectTimeout: 1000 });
    // connect lazily in background
    redis.on('error', (err) => {
      console.error('Redis error', err && err.message);
    });
    redis.connect().catch((err) => {
      console.warn('Redis connect failed', err && err.message);
    });
    return redis;
  } catch (err) {
    console.warn('Failed to create Redis client', err && err.message);
    return null;
  }
}

module.exports = {
  getClient: () => createClient(),
};
