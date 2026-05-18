import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import redis from 'redis';

const redisClient = redis.createClient({
    username: env.REDIS_USERNAME || undefined,
    password: env.REDIS_PASSWORD || undefined,
    socket: {
        host: env.REDIS_HOST || 'localhost',
        port: env.REDIS_PORT || 6379,
    }
});

redisClient.on('connect', () => {
    logger.info('Redis connected successfully');
});

redisClient.on('error', (err) => {
    logger.error('Redis connection error:', err);
});

redisClient.on('disconnect', () => {
    logger.info('Redis disconnected');
});

export default redisClient;