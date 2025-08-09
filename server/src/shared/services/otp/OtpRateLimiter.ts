import Redis from "ioredis";

import redisClient from "../../../shared/utils/Redis"; 

export class OtpRateLimiter {
  constructor(private readonly keyPrefix: string = "otp:rate_limit" , private readonly redis:Redis = redisClient) {}
  

  async isBlocked(email: string): Promise<number | null> {
    const key = `${this.keyPrefix}:${email}`;
    const ttl = await this.redis.ttl(key);
    return ttl > 0 ? ttl : null;
  }

  async block(email: string, seconds: number = 120): Promise<void> {
    const key = `${this.keyPrefix}:${email}`;
    await this.redis.set(key, "1", "EX", seconds);
  }
}
