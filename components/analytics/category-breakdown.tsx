"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

interface CategoryData {
  name: string
  value: number
  color: string
}

export function CategoryBreakdown() {
  const [data, setData] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategoryData() {
      try {
        const response = await fetch("/api/analytics/categories")
        if (response.ok) {
          const categoryData = await response.json()
          setData(
            categoryData.map((item: any, index: number) => ({
              ...item,
              color: COLORS[index % COLORS.length],
            })),
          )
        }
      } catch (error) {
        console.error("Error fetching category data:", error)
        // Fallback data
        setData([
          { name: "Food & Dining", value: 2400, color: COLORS[0] },
          { name: "Transportation", value: 1800, color: COLORS[1] },
          { name: "Shopping", value: 1200, color: COLORS[2] },
          { name: "Entertainment", value: 800, color: COLORS[3] },
          { name: "Bills & Utilities", value: 1500, color: COLORS[4] },
          { name: "Healthcare", value: 600, color: COLORS[5] },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>Spending by category this month</CardDescription>
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
        <CardTitle>Category Breakdown</CardTitle>
        <CardDescription>Spending by category this month</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
