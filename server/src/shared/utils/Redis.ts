import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null, // Don't crash if retries exceed limit
  enableOfflineQueue: false, // If Redis is down, fail commands instantly instead of hanging the app
  retryStrategy(times) {
    // Reconnect after
    return Math.min(times * 50, 2000);
  },
});

redis.on('connect', () => {
  console.info('✅ Connected to Redis Cloud');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err.message);
  // We intentionally don't throw here so the server doesn't crash
});

export default redis;
