"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

interface SpendingData {
  month: string
  spending: number
  income: number
}

export function SpendingChart() {
  const [data, setData] = useState<SpendingData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSpendingData() {
      try {
        const response = await fetch("/api/analytics/spending")
        if (response.ok) {
          const spendingData = await response.json()
          setData(spendingData)
        }
      } catch (error) {
        console.error("Error fetching spending data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSpendingData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending Trends</CardTitle>
          <CardDescription>Monthly income vs expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Trends</CardTitle>
        <CardDescription>Monthly income vs expenses</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            spending: {
              label: "Spending",
              color: "hsl(var(--chart-1))",
            },
            income: {
              label: "Income",
              color: "hsl(var(--chart-2))",
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
              <Line type="monotone" dataKey="spending" stroke="var(--color-spending)" strokeWidth={2} />
              <Line type="monotone" dataKey="income" stroke="var(--color-income)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
