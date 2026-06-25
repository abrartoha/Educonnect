import redisClient from "../../../db/redis.js";
import { createFingerprint } from "./fingerPrint.js";

/**
 * Creates a custom rate limiter middleware function
 * @param {Object} options - Configuration object
 * @param {number} options.window - Time window in seconds
 * @param {number} [options.limit=5] - Max requests allowed within the window
 * @param {string} [options.scope="ip"] - "ip" | "user" | "email" to determine rate limit key structure
 * @param {boolean} [options.routeSpecificLimit] - Optional route-specific limit identifier (e.g., "/api/auth/login", "/api/auth/signup")
 * @param {number} [options.blockDuration=0] - Optional duration to block after exceeding limit (in seconds)
 * @returns {function} Express middleware function
 */

export function rateLimiter({
  window,
  limit = 5,
  scope = "ip", // ip | user | email
  routeSpecificLimit=false,
  blockDuration = 0,
}) {
  return async (req, res, next) => {
    try {
      // We can add more scopes like "apiKey", "sessionId", etc. based on the application's needs.
      const { fingerPrint, identifier } = createFingerprint(req, scope);
      const route = routeSpecificLimit ? (req.route?.path || req.path) : "global";
      // Fingerpirnt contains (IP + UA) => (hashed)
      const key = `rl:${scope}:${identifier}:${route}:${fingerPrint}:${window}`;

      // Check if user is already blocked
      const isBlocked = await redisClient.exists(`${key}:blocked`);
      if (isBlocked) {
        return res.status(429).json({
          success: false,
          message: "You are temporarily blocked due to repeated rate limit violations.",
        });
      }

      const currentCount = await redisClient.incr(key);

      if (currentCount === 1) {
        await redisClient.expire(key, window);
      }

      if (currentCount > limit) {
        if (blockDuration > 0) {
          await redisClient.set(
            `${key}:blocked`,
            "1",
            {
              EX: blockDuration,
            }
          );
        }
        return res.status(429).json({
          success: false,
          message: "Too many requests.",
        });
      }
      // optional headers (industry standard)
      res.setHeader("X-RateLimit-Limit", limit);
      res.setHeader("X-RateLimit-Remaining", Math.max(0, limit - currentCount));
      next();
    } catch (err) {
      // Fail open or fail closed?
      // Production choice: usually FAIL OPEN to avoid blocking users
      console.error("Rate limiter error:", err);
      next();
    }
  };
}