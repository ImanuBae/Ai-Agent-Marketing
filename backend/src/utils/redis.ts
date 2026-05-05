import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL ?? '';

let redis: Redis | null = null;

if (REDIS_URL.startsWith('redis://') || REDIS_URL.startsWith('rediss://')) {
  redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 2,
    enableOfflineQueue: false,
  });

  redis.on('error', (err: Error) => {
    console.error('⚠️  Redis error:', err.message);
  });

  redis.on('connect', () => {
    console.log('✅  Redis connected');
  });
}

export default redis;
