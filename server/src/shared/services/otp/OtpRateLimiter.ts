import Redis from 'ioredis';
import redisClient from '../../../shared/utils/Redis';
import { IOtpRateLimiter } from './interfaces/IOtpRateLimiter';

/** Handles otp rate limiter functionality. */
export class OtpRateLimiter implements IOtpRateLimiter {
  constructor(
    private readonly _keyPrefix: string = 'otp:rate_limit',
    private readonly _redis: Redis = redisClient,
  ) {}

  /**
   * Is blocked for the OtpRateLimiter entity.
   *
   * @param email - The email information.
   * @returns The result of the operation.
   */
  async isBlocked(email: string): Promise<number | null> {
    const key = `${this._keyPrefix}:${email}`;
    const ttl = await this._redis.ttl(key);
    return ttl > 0 ? ttl : null;
  }

  /**
   * Block for the OtpRateLimiter entity.
   *
   * @param email - The email information.
   * @param seconds - The seconds information.
   */
  async block(email: string, seconds: number = 120): Promise<void> {
    const key = `${this._keyPrefix}:${email}`;
    await this._redis.set(key, '1', 'EX', seconds);
  }
}
