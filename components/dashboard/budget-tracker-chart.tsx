"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface BudgetCategory {
  name: string
  budgeted: number
  spent: number
  remaining: number
  color?: string
}

interface BudgetData {
  id: string
  name: string
  totalAmount: number
  totalSpent: number
  totalRemaining: number
  categories: BudgetCategory[]
  utilization: number
}

const COLORS = [
  "#FFD700", // Gold
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#96CEB4", // Green
  "#FFEAA7", // Yellow
  "#DDA0DD", // Plum
  "#98D8C8", // Mint
  "#F7DC6F", // Light Yellow
  "#BB8FCE", // Light Purple
]

export function BudgetTrackerChart() {
  const [budgetData, setBudgetData] = useState<BudgetData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBudget, setSelectedBudget] = useState<BudgetData | null>(null)

  useEffect(() => {
    fetchBudgetData()
  }, [])

  async function fetchBudgetData() {
    try {
      const response = await fetch("/api/budgets?status=active")
      if (response.ok) {
        const data = await response.json()
        setBudgetData(data.budgets || [])
        if (data.budgets && data.budgets.length > 0) {
          setSelectedBudget(data.budgets[0])
        }
      }
    } catch (error) {
      console.error("Error fetching budget data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Budget Tracker</CardTitle>
          <CardDescription>Category-wise spending breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <Skeleton className="h-48 w-48 rounded-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!selectedBudget || budgetData.length === 0) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Budget Tracker</CardTitle>
          <CardDescription>Category-wise spending breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active budgets found</p>
              <p className="text-sm">Create a budget to see your spending breakdown</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare chart data
  const chartData = selectedBudget.categories.map((category, index) => ({
    name: category.name,
    spent: category.spent,
    budgeted: category.budgeted,
    remaining: category.remaining,
    utilization: category.budgeted > 0 ? (category.spent / category.budgeted) * 100 : 0,
    color: COLORS[index % COLORS.length],
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            Spent: ${data.spent.toFixed(2)} / ${data.budgeted.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground">Utilization: {data.utilization.toFixed(1)}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Budget Tracker</CardTitle>
            <CardDescription>Category-wise spending breakdown</CardDescription>
          </div>
          {budgetData.length > 1 && (
            <select
              value={selectedBudget.id}
              onChange={(e) => {
                const budget = budgetData.find((b) => b.id === e.target.value)
                if (budget) setSelectedBudget(budget)
              }}
              className="px-3 py-1 border rounded-md text-sm"
            >
              {budgetData.map((budget) => (
                <option key={budget.id} value={budget.id}>
                  {budget.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="spent"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown */}
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold">{selectedBudget.name}</h3>
              <p className="text-2xl font-bold">
                ${selectedBudget.totalSpent.toFixed(2)} / ${selectedBudget.totalAmount.toFixed(2)}
              </p>
              <Badge
                variant={
                  selectedBudget.utilization > 100
                    ? "destructive"
                    : selectedBudget.utilization > 80
                      ? "warning"
                      : "success"
                }
                className="mt-1"
              >
                {selectedBudget.utilization.toFixed(1)}% Used
              </Badge>
            </div>

            <div className="space-y-3 max-h-48 overflow-y-auto">
              {chartData.map((category, index) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>${category.spent.toFixed(2)}</span>
                      {category.utilization > 100 ? (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      ) : category.utilization > 80 ? (
                        <TrendingUp className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                  <Progress
                    value={Math.min(category.utilization, 100)}
                    className="h-2"
                    style={
                      {
                        "--progress-background": category.color,
                      } as React.CSSProperties
                    }
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{category.utilization.toFixed(1)}% used</span>
                    <span>${category.remaining.toFixed(2)} remaining</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
