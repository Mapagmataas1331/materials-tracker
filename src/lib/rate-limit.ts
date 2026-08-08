/**
 * Minimal in-memory sliding-window rate limiter. Good enough for a single
 * self-hosted Node.js process serving up to ~15 users on one server (ТЗ
 * п.1) — there is no second app instance to keep this in sync with, so a
 * dependency like Redis would be pure overhead here. If the deployment
 * ever grows to multiple app instances behind a load balancer, swap this
 * for a shared store.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Sweep occasionally so `buckets` cannot grow unbounded if an attacker
// cycles through many different logins.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}, 5 * 60 * 1000);

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  return bucket.count > limit;
}
