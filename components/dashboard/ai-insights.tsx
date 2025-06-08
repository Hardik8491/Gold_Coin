"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bot, TrendingUp, AlertTriangle, Lightbulb, ArrowRight, RefreshCw, Sparkles } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

interface AIInsight {
  type: "spending_pattern" | "savings_opportunity" | "goal_progress" | "budget_alert"
  title: string
  message: string
  severity: "info" | "warning" | "success" | "error"
  actionable: boolean
  suggestions: string[]
  category?: string
  impact: "low" | "medium" | "high"
  confidence: number
}

interface AIInsightsResponse {
  insights: AIInsight[]
  generatedAt: string
}

const severityConfig = {
  warning: {
    icon: AlertTriangle,
    color: "text-warning",
    bgColor: "bg-warning/10 border border-warning/20",
    badgeVariant: "warning" as const,
  },
  info: {
    icon: Lightbulb,
    color: "text-info",
    bgColor: "bg-info/10 border border-info/20",
    badgeVariant: "info" as const,
  },
  success: {
    icon: TrendingUp,
    color: "text-success",
    bgColor: "bg-success/10 border border-success/20",
    badgeVariant: "success" as const,
  },
  error: {
    icon: AlertTriangle,
    color: "text-destructive",
    bgColor: "bg-destructive/10 border border-destructive/20",
    badgeVariant: "destructive" as const,
  },
}

export function AIInsights() {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchInsights = async () => {
    try {
      setRefreshing(true)
      const response = await fetch("/api/ai/insights")
      if (response.ok) {
        const data: AIInsightsResponse = await response.json()
        setInsights(data.insights.slice(0, 3)) // Show top 3 insights
      }
    } catch (error) {
      console.error("Error fetching AI insights:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchInsights()
  }, [])

  if (loading) {
    return (
      <Card variant="hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Insights
          </CardTitle>
          <CardDescription>Personalized recommendations powered by AI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-start gap-3">
                <Skeleton className="h-4 w-4 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="premium">
      <CardHeader variant="premium">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-600" />
            <CardTitle>AI Insights</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={fetchInsights} disabled={refreshing} className="h-8 w-8 p-0">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
        <CardDescription>Personalized recommendations powered by AI</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No insights available at the moment</p>
          </div>
        ) : (
          insights.map((insight, index) => {
            const config = severityConfig[insight.severity]
            return (
              <div key={index} className={`p-4 rounded-lg ${config.bgColor}`}>
                <div className="flex items-start gap-3">
                  <config.icon className={`h-4 w-4 mt-0.5 ${config.color}`} />
                  <div className="flex-1 space-y-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{insight.title}</p>
                        <Badge variant={config.badgeVariant} size="sm">
                          {insight.impact}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{insight.message}</p>
                    </div>
                    {insight.actionable && insight.suggestions.length > 0 && (
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                        View Suggestions
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
