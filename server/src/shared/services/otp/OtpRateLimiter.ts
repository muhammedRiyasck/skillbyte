import Redis from "ioredis";


export class OtpRateLimiter {
  constructor(private readonly keyPrefix: string = "otp:rate_limit" , private readonly redis:any = new Redis()) {}
  

  async isBlocked(email: string): Promise<number | null> {
    const key = `${this.keyPrefix}:${email}`;
    const ttl = await this.redis.ttl(key);k
    return ttl > 0 ? ttl : null;
  }

  async block(email: string, seconds: number = 120): Promise<void> {
    const key = `${this.keyPrefix}:${email}`;
    await this.redis.set(key, "1", "EX", seconds);
  }
}
