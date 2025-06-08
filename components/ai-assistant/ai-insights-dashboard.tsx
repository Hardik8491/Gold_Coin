"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, AlertTriangle, Lightbulb, Target, DollarSign } from "lucide-react"

interface Insight {
  id: string
  type: "opportunity" | "warning" | "achievement" | "recommendation"
  title: string
  description: string
  impact: number
  category: string
  actionable: boolean
}

export function AIInsightsDashboard() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInsights() {
      try {
        const response = await fetch("/api/ai/insights")
        if (response.ok) {
          const data = await response.json()
          setInsights(data.insights)
        }
      } catch (error) {
        console.error("Error fetching insights:", error)
        // Fallback data
        setInsights([
          {
            id: "1",
            type: "opportunity",
            title: "Potential Savings Opportunity",
            description:
              "You could save $120/month by switching to a different phone plan based on your usage patterns.",
            impact: 120,
            category: "Bills & Utilities",
            actionable: true,
          },
          {
            id: "2",
            type: "warning",
            title: "Budget Overspend Alert",
            description: "Your dining expenses are 23% over budget this month. Consider meal planning to reduce costs.",
            impact: -85,
            category: "Food & Dining",
            actionable: true,
          },
          {
            id: "3",
            type: "achievement",
            title: "Savings Goal Progress",
            description: "Congratulations! You're ahead of schedule on your vacation savings goal by $200.",
            impact: 200,
            category: "Goals",
            actionable: false,
          },
          {
            id: "4",
            type: "recommendation",
            title: "Investment Opportunity",
            description: "Based on your cash flow, you could invest an additional $300/month in your retirement fund.",
            impact: 300,
            category: "Investments",
            actionable: true,
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [])

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "opportunity":
        return <TrendingUp className="h-5 w-5 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      case "achievement":
        return <Target className="h-5 w-5 text-blue-600" />
      case "recommendation":
        return <Lightbulb className="h-5 w-5 text-yellow-600" />
      default:
        return <DollarSign className="h-5 w-5 text-gray-600" />
    }
  }

  const getInsightBadgeColor = (type: string) => {
    switch (type) {
      case "opportunity":
        return "bg-green-100 text-green-800"
      case "warning":
        return "bg-red-100 text-red-800"
      case "achievement":
        return "bg-blue-100 text-blue-800"
      case "recommendation":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Insights</CardTitle>
          <CardDescription>Personalized financial recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 animate-pulse bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Insights</CardTitle>
        <CardDescription>Personalized financial recommendations powered by AI</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight) => (
            <div key={insight.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getInsightIcon(insight.type)}
                  <h4 className="font-semibold">{insight.title}</h4>
                </div>
                <Badge className={getInsightBadgeColor(insight.type)}>{insight.type}</Badge>
              </div>

              <p className="text-sm text-muted-foreground">{insight.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">Impact:</span>
                  <span className={`font-semibold ${insight.impact > 0 ? "text-green-600" : "text-red-600"}`}>
                    {insight.impact > 0 ? "+" : ""}${Math.abs(insight.impact)}
                  </span>
                  <Badge variant="outline">{insight.category}</Badge>
                </div>

                {insight.actionable && (
                  <Button size="sm" variant="outline">
                    Take Action
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
