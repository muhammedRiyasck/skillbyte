import Redis from "ioredis";

const redis = new Redis()

export class OtpRateLimiter {
  private keyPrefix = "otp:cooldown";

  async isBlocked(email: string): Promise<number | null> {
    const key = `${this.keyPrefix}:${email}`;
    const ttl = await redis.ttl(key);
    return ttl > 0 ? ttl : null;
  }

  async block(email: string, seconds: number = 120): Promise<void> {
    const key = `${this.keyPrefix}:${email}`;
    await redis.set(key, "1", "EX", seconds);
  }
}
