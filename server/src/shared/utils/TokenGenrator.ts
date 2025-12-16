import crypto from 'crypto';
import redis from './Redis';

export async function createPasswordResetToken(userId: string) {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  // Store in Redis: key = token, value = userId, expire in 15 min
  await redis.setex(`reset:${tokenHash}`, 900, userId.toString());

  return tokenHash;
}
