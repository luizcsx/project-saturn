import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
});

export async function checkRateLimit(req, res) {
  const ip = req.headers['x-forwarded-for'] ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    res.status(429).json({ error: 'Too many requests. Try again later.' });
    return false;
  }
  return true;
}
