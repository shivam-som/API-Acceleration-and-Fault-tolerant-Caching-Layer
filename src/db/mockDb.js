// simple mock DB to simulate latency and data
const { v4: uuidv4 } = require('uuid');

const store = new Map();

// seed some data
for (let i = 1; i <= 5; i++) {
  store.set(`order-${i}`, {
    id: `order-${i}`,
    items: [{ sku: `SKU-${i}`, qty: i }],
    amount: 10 * i,
    createdAt: Date.now(),
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getOrder(id) {
  // simulate DB latency
  await sleep(200 + Math.random() * 200);
  return store.get(id) || null;
}

async function createOrder(payload) {
  const id = `order-${Math.floor(Math.random() * 100000)}`;
  const item = { id, ...payload, createdAt: Date.now() };
  store.set(id, item);
  return item;
}

module.exports = { getOrder, createOrder };
