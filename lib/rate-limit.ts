import { Ratelimit } from "@upstash/ratelimit"
import { redis } from "@/lib/redis"

// Create different rate limiters for different endpoints
export const rateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
  analytics: true,
})

export const strictRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 requests per minute for AI endpoints
  analytics: true,
})

export const emailRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(2, "1 h"), // 2 emails per hour
  analytics: true,
})
