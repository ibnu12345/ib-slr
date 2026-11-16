interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory rate limiting map keyed by IP/action
const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * Basic in-memory rate limiter for sensitive endpoints (login, register, reset password)
 * @param key Unique key e.g. `login:127.0.0.1` or `register:user@email.com`
 * @param maxRequests Maximum requests allowed in window
 * @param windowMs Time window in milliseconds
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 5,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetInMs: windowMs,
    };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetInMs: Math.max(0, record.resetAt - now),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetInMs: Math.max(0, record.resetAt - now),
  };
}
