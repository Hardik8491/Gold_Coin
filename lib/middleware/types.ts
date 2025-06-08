export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

export interface RequestMetadata {
  id: string
  startTime: number
  ip: string
  userAgent: string
  pathname: string
  method: string
  userId?: string
}

export interface MiddlewareConfig {
  rateLimiting: {
    enabled: boolean
    skipRoutes: string[]
  }
  security: {
    enabled: boolean
    strictMode: boolean
  }
  logging: {
    enabled: boolean
    level: "error" | "warn" | "info" | "debug"
  }
  cors: {
    enabled: boolean
    origins: string[]
  }
}
