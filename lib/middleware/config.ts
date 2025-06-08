import type { MiddlewareConfig } from "./types"

export const middlewareConfig: MiddlewareConfig = {
  rateLimiting: {
    enabled: process.env.NODE_ENV === "production",
    skipRoutes: ["/api/health", "/api/webhooks/clerk", "/_next/static"],
  },
  security: {
    enabled: true,
    strictMode: process.env.NODE_ENV === "production",
  },
  logging: {
    enabled: true,
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
  },
  cors: {
    enabled: true,
    origins:
      process.env.NODE_ENV === "production"
        ? [process.env.NEXT_PUBLIC_APP_URL || "https://goldcoin.app"]
        : ["http://localhost:3000"],
  },
}
