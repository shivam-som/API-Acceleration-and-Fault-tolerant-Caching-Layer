# API Acceleration and Fault-tolerant Caching Layer

**Description**: Created a high-performance distributed caching layer using Redis/ElastiCache to accelerate frequently accessed APIs. This project demonstrates reducing database load, minimizing latency for read-heavy endpoints, and improving overall throughput for large-scale applications.

## Features
- Express-based API server with caching middleware.
- Redis (ioredis) as the caching store with automatic failover to DB on cache miss or Redis errors.
- Cache stampede protection using simple in-process locks and double-checked locking.
- TTL configuration per route and cache invalidation endpoints.
- Docker & docker-compose for local testing (includes Redis service).
- Simple mock DB module to simulate slow data source (replaceable with real DB).

## Project Structure
- `src/`
  - `index.js` - Express server and routes.
  - `cache/redisClient.js` - Redis client wrapper with fault-tolerance.
  - `cache/cacheMiddleware.js` - Caching middleware for routes.
  - `db/mockDb.js` - Mock DB to simulate latency and read operations.
  - `config.js` - configuration values (TTL, Redis URL).
- `docker-compose.yml` - Redis service for local testing.
- `Dockerfile` - Dockerfile for the API server.
- `package.json` - Node project metadata and scripts.
- `tests/` - sample test script (node) to show usage.

## Quickstart (local)
Prerequisites: Docker, Node 18+, npm/yarn.

1. Start Redis locally with docker-compose:
   ```bash
   docker-compose up -d
   ```
2. Install deps and run server:
   ```bash
   npm install
   npm start
   ```
3. Example requests:
   - GET /api/orders/:id  -> returns order (cached)
   - POST /admin/invalidate/orders/:id -> invalidates cache for order

## How it works (summary)
- On request, the cache middleware attempts to read from Redis.
- On cache hit: returns cached response quickly.
- On cache miss: acquires an in-process lock to prevent stampede, reads from DB, stores result in Redis with TTL, and returns it.
- If Redis is down/unreachable, middleware falls back to DB and serves responses directly (fault-tolerant).

## Production notes
- Replace `mockDb` with real DB (Postgres, MongoDB, etc.).
- Use Redis Cluster or AWS ElastiCache with Multi-AZ in production.
- Improve stampede protection with distributed locks (RedLock) if multiple app instances.
- Add metrics (Prometheus/CloudWatch) and tracing (OpenTelemetry/X-Ray).

