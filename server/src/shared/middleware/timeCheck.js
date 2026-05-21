import crypto from 'crypto';
import { env } from '../../config/env.js';
import redisClient from '../../db/redis.js';

// timeCheck — check Redis and delete after use
export async function timeCheck(req, res, next) {
  const { formToken } = req.body;
  const secret = env.FORM_TOKEN_SECRET;

  if (!formToken) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  const [timestamp, hmac] = formToken.split('.');

  if (!timestamp || !hmac) {
    return res.status(400).json({ message: 'Invalid request' });
  }
  // Verify HMAC
  const expected = crypto
    .createHmac('sha256', secret)
    .update(timestamp)
    .digest('hex');

  if (hmac !== expected) {
    return res.status(403).json({ message: 'Invalid request' });
  }

  // Check token exists in Redis (not already used)
  const exists = await redisClient.get(`formtoken:${formToken}`);

  if (!exists) {
    return res.status(403).json({ message: 'Invalid form submission' });
  }

  // Delete it — one time use only
  await redisClient.del(`formtoken:${formToken}`);

  // Time check
  const timeSpent = Date.now() - Number(timestamp);

  // Dummb bot. Filled too fast. So, silently rejected.
  if (timeSpent < 3000) return res.status(200).json({ message: 'OK' });

  // Session expired. User took too long. Force them to refresh the form.
  if (timeSpent > 30 * 60 * 1000) return res.status(400).json({ message: 'Session expired' });

  next();
}

// We can implement route specific time checks.