export interface IOtpRateLimiter {
  isBlocked(email: string): Promise<number | null>;
  block(email: string, seconds?: number): Promise<void>;
}
