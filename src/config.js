module.exports = {
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  CACHE_TTL_SECS: 60, // default TTL
  PORT: process.env.PORT || 3000,
};
