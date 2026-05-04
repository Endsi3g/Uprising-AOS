/**
 * Simple in-memory rate limiter.
 * Resets per window per identifier (IP or user ID).
 * NOTE: This is per-instance; for multi-replica deployments use Upstash Redis.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

interface RateLimitOptions {
  /** Max requests allowed in the window */
  limit: number
  /** Window duration in seconds */
  windowSec: number
}

export function rateLimit(identifier: string, options: RateLimitOptions): { success: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const windowMs = options.windowSec * 1000

  let entry = store.get(identifier)

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs }
    store.set(identifier, entry)
  }

  entry.count++

  const remaining = Math.max(0, options.limit - entry.count)
  const resetIn = Math.ceil((entry.resetAt - now) / 1000)

  if (entry.count > options.limit) {
    return { success: false, remaining: 0, resetIn }
  }

  return { success: true, remaining, resetIn }
}
