"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Heart, Shield, TrendingUp, AlertTriangle } from "lucide-react"

interface HealthMetric {
  name: string
  score: number
  status: "excellent" | "good" | "fair" | "poor"
  description: string
}

export function FinancialHealth() {
  const [metrics, setMetrics] = useState<HealthMetric[]>([])
  const [overallScore, setOverallScore] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHealthData() {
      try {
        const response = await fetch("/api/analytics/health")
        if (response.ok) {
          const healthData = await response.json()
          setMetrics(healthData.metrics)
          setOverallScore(healthData.overallScore)
        }
      } catch (error) {
        console.error("Error fetching health data:", error)
        // Fallback data
        const fallbackMetrics = [
          {
            name: "Emergency Fund",
            score: 75,
            status: "good" as const,
            description: "3.2 months of expenses covered",
          },
          {
            name: "Debt-to-Income",
            score: 85,
            status: "excellent" as const,
            description: "15% debt-to-income ratio",
          },
          {
            name: "Savings Rate",
            score: 60,
            status: "fair" as const,
            description: "12% of income saved monthly",
          },
          {
            name: "Budget Adherence",
            score: 90,
            status: "excellent" as const,
            description: "Staying within budget 90% of time",
          },
        ]
        setMetrics(fallbackMetrics)
        setOverallScore(77)
      } finally {
        setLoading(false)
      }
    }

    fetchHealthData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-100 text-green-800"
      case "good":
        return "bg-blue-100 text-blue-800"
      case "fair":
        return "bg-yellow-100 text-yellow-800"
      case "poor":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getOverallStatus = (score: number) => {
    if (score >= 80) return { status: "Excellent", color: "text-green-600", icon: Heart }
    if (score >= 60) return { status: "Good", color: "text-blue-600", icon: Shield }
    if (score >= 40) return { status: "Fair", color: "text-yellow-600", icon: TrendingUp }
    return { status: "Needs Attention", color: "text-red-600", icon: AlertTriangle }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Health</CardTitle>
          <CardDescription>Overall financial wellness score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-20 animate-pulse bg-muted rounded" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 animate-pulse bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const overallStatus = getOverallStatus(overallScore)
  const StatusIcon = overallStatus.icon

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Financial Health
          <StatusIcon className={`h-5 w-5 ${overallStatus.color}`} />
        </CardTitle>
        <CardDescription>Overall financial wellness score</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">{overallScore}/100</div>
          <Badge className={getStatusColor(overallStatus.status.toLowerCase())}>{overallStatus.status}</Badge>
        </div>

        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{metric.name}</span>
                <Badge className={getStatusColor(metric.status)}>{metric.status}</Badge>
              </div>
              <Progress value={metric.score} className="h-2" />
              <p className="text-xs text-muted-foreground">{metric.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
