const fetch = require('node-fetch');
(async () => {
  console.log('Run instructions:');
  console.log('1) Start redis via docker-compose up -d');
  console.log('2) npm install');
  console.log('3) npm start');
  console.log('Then try:');
  console.log('GET http://localhost:3000/api/orders/order-1  (should be cached on first miss)');
})();
