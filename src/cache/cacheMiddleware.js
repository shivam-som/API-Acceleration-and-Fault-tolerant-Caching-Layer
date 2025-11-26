const { getClient } = require('./redisClient');
const { CACHE_TTL_SECS } = require('../config');

// simple in-process locks to reduce stampede for single-instance demo
const locks = new Map();

function cacheMiddleware(keyGenerator, ttlSec = CACHE_TTL_SECS) {
  return async function (req, res, next) {
    const redis = getClient();
    const key = keyGenerator(req);
    // try redis if available
    if (!redis) {
      // no redis: proceed to next and rely on DB
      return next();
    }
    try {
      const cached = await redis.get(key);
      if (cached) {
        // cached body stored as JSON string
        res.set('x-cache', 'HIT');
        return res.json(JSON.parse(cached));
      }
      // cache miss: attempt lock
      if (locks.has(key)) {
        // another request is populating cache: wait and then serve from cache
        const waitFor = () => new Promise((resolve) => {
          const interval = setInterval(async () => {
            const v = await redis.get(key);
            if (v) {
              clearInterval(interval);
              resolve(JSON.parse(v));
            }
          }, 50);
        });
        const data = await waitFor();
        res.set('x-cache', 'HIT_AFTER_WAIT');
        return res.json(data);
      }
      // acquire lock
      locks.set(key, true);
      // proceed to next which should populate res.locals.__cachePayload
      await new Promise((resolve, reject) => {
        // wrap next to intercept send
        const originalJson = res.json.bind(res);
        res.json = async (body) => {
          try {
            // store in redis
            await redis.set(key, JSON.stringify(body), 'EX', ttlSec);
          } catch (e) {
            console.warn('Redis set failed', e && e.message);
          } finally {
            locks.delete(key);
            res.set('x-cache', 'MISS');
            originalJson(body);
            resolve();
          }
        };
        next();
      });
    } catch (err) {
      console.error('Cache middleware error', err && err.message);
      // On any cache failure, fall back to normal route handling
      return next();
    }
  };
}

module.exports = { cacheMiddleware };
