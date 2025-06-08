"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"

interface TrendData {
  month: string
  income: number
  expenses: number
  savings: number
}

export function TrendAnalysis() {
  const [data, setData] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)
  const [trend, setTrend] = useState<"up" | "down">("up")

  useEffect(() => {
    async function fetchTrendData() {
      try {
        const response = await fetch("/api/analytics/trends")
        if (response.ok) {
          const trendData = await response.json()
          setData(trendData)

          // Calculate trend
          if (trendData.length >= 2) {
            const recent = trendData[trendData.length - 1].savings
            const previous = trendData[trendData.length - 2].savings
            setTrend(recent > previous ? "up" : "down")
          }
        }
      } catch (error) {
        console.error("Error fetching trend data:", error)
        // Fallback data
        setData([
          { month: "Jan", income: 5000, expenses: 3200, savings: 1800 },
          { month: "Feb", income: 5200, expenses: 3400, savings: 1800 },
          { month: "Mar", income: 4800, expenses: 3100, savings: 1700 },
          { month: "Apr", income: 5500, expenses: 3600, savings: 1900 },
          { month: "May", income: 5300, expenses: 3300, savings: 2000 },
          { month: "Jun", income: 5600, expenses: 3500, savings: 2100 },
        ])
        setTrend("up")
      } finally {
        setLoading(false)
      }
    }

    fetchTrendData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trend Analysis</CardTitle>
          <CardDescription>6-month financial trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Trend Analysis
          {trend === "up" ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardTitle>
        <CardDescription>6-month financial trends</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            income: {
              label: "Income",
              color: "hsl(var(--chart-1))",
            },
            expenses: {
              label: "Expenses",
              color: "hsl(var(--chart-2))",
            },
            savings: {
              label: "Savings",
              color: "hsl(var(--chart-3))",
            },
          }}
          className="h-80"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="income" stroke="var(--color-income)" strokeWidth={2} name="Income" />
              <Line type="monotone" dataKey="expenses" stroke="var(--color-expenses)" strokeWidth={2} name="Expenses" />
              <Line type="monotone" dataKey="savings" stroke="var(--color-savings)" strokeWidth={2} name="Savings" />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
