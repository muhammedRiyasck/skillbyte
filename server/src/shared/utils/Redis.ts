import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

redis.on('connect', () => {
  console.info('✅ Connected to Redis Cloud');
});

redis.on('error', (err) => {
  console.error('Redis error:', err.message);
});

export default redis;
