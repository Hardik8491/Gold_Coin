import { Redis } from "@upstash/redis"

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error("Redis environment variables are required")
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

// Cache keys
export const CACHE_KEYS = {
  USER_DASHBOARD: (userId: string) => `dashboard:${userId}`,
  USER_TRANSACTIONS: (userId: string, page: number) => `transactions:${userId}:${page}`,
  USER_BUDGETS: (userId: string) => `budgets:${userId}`,
  USER_GOALS: (userId: string) => `goals:${userId}`,
  EXCHANGE_RATES: "exchange_rates",
  AI_INSIGHTS: (userId: string) => `ai_insights:${userId}`,
  LEADERBOARD: "gamification:leaderboard",
} as const

// Cache TTL in seconds
export const CACHE_TTL = {
  DASHBOARD: 300, // 5 minutes
  TRANSACTIONS: 600, // 10 minutes
  BUDGETS: 300, // 5 minutes
  GOALS: 300, // 5 minutes
  EXCHANGE_RATES: 3600, // 1 hour
  AI_INSIGHTS: 1800, // 30 minutes
  LEADERBOARD: 300, // 5 minutes
} as const
