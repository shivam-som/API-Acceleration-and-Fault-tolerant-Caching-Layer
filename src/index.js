const express = require('express');
const bodyParser = require('body-parser');
const { cacheMiddleware } = require('./cache/cacheMiddleware');
const { getOrder, createOrder } = require('./db/mockDb');
const { getClient } = require('./cache/redisClient');
const { PORT } = require('./config');

const app = express();
app.use(bodyParser.json());

// cache key generator for orders
const orderKeyGen = (req) => `orders:${req.params.id}`;

// GET order with caching
app.get('/api/orders/:id', cacheMiddleware(orderKeyGen, 30), async (req, res) => {
  const id = req.params.id;
  const order = await getOrder(id);
  if (!order) return res.status(404).json({ error: 'not found' });
  // this res.json will be intercepted by middleware to cache the response
  return res.json(order);
});

// POST create order (invalidate / set cache)
app.post('/api/orders', async (req, res) => {
  const payload = req.body;
  const created = await createOrder(payload);
  // set cache proactively
  const redis = getClient();
  const key = `orders:${created.id}`;
  if (redis) {
    try {
      await redis.set(key, JSON.stringify(created), 'EX', 60);
    } catch (e) {
      console.warn('Failed to set cache on create', e && e.message);
    }
  }
  return res.status(201).json(created);
});

// Admin: invalidate cache for an order
app.post('/admin/invalidate/orders/:id', async (req, res) => {
  const redis = getClient();
  const key = `orders:${req.params.id}`;
  if (redis) {
    try {
      await redis.del(key);
    } catch (e) {
      console.warn('Failed to delete cache', e && e.message);
    }
  }
  return res.json({ invalidated: req.params.id });
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
