import Redis from 'ioredis';

import redisClient from '../../../shared/utils/Redis';

export class OtpRateLimiter {
  constructor(
    private readonly _keyPrefix: string = 'otp:rate_limit',
    private readonly _redis: Redis = redisClient,
  ) {}

  async isBlocked(email: string): Promise<number | null> {
    const key = `${this._keyPrefix}:${email}`;
    const ttl = await this._redis.ttl(key);
    return ttl > 0 ? ttl : null;
  }

  async block(email: string, seconds: number = 120): Promise<void> {
    const key = `${this._keyPrefix}:${email}`;
    await this._redis.set(key, '1', 'EX', seconds);
  }
}
