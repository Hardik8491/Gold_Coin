"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface BudgetOverview {
  totalBudgeted: number
  totalSpent: number
  totalRemaining: number
  overallUtilization: number
  categoriesOverBudget: number
  categoriesOnTrack: number
  monthlyTrend: number
}

export function BudgetOverview() {
  const [overview, setOverview] = useState<BudgetOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOverview()
  }, [])

  async function fetchOverview() {
    try {
      const response = await fetch("/api/budgets/overview")
      if (response.ok) {
        const data = await response.json()
        setOverview(data)
      }
    } catch (error) {
      console.error("Error fetching budget overview:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
          <CardDescription>Your spending summary this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!overview) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
          <CardDescription>Your spending summary this month</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">No budget data available</p>
        </CardContent>
      </Card>
    )
  }

  const isOverBudget = overview.overallUtilization > 100
  const isNearLimit = overview.overallUtilization > 80

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Overview</CardTitle>
        <CardDescription>Your spending summary this month</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Overall Budget Progress</h3>
            <Badge variant={isOverBudget ? "destructive" : isNearLimit ? "secondary" : "default"}>
              {Math.round(overview.overallUtilization)}%
            </Badge>
          </div>

          <Progress value={Math.min(overview.overallUtilization, 100)} className="h-3" />

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">${overview.totalSpent.toLocaleString()} spent</span>
            <span className="text-muted-foreground">${overview.totalBudgeted.toLocaleString()} budgeted</span>
          </div>

          {isOverBudget && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>You're over budget by ${(overview.totalSpent - overview.totalBudgeted).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">On Track</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{overview.categoriesOnTrack}</p>
            <p className="text-xs text-muted-foreground">categories</p>
          </div>

          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Over Budget</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{overview.categoriesOverBudget}</p>
            <p className="text-xs text-muted-foreground">categories</p>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Monthly Trend</h4>
              <p className="text-sm text-muted-foreground">Compared to last month</p>
            </div>
            <div className="flex items-center gap-2">
              {overview.monthlyTrend > 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-red-600" />
                  <span className="text-red-600">+{overview.monthlyTrend.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">{overview.monthlyTrend.toFixed(1)}%</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Remaining Budget */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100">Remaining This Month</h4>
          <p className="text-2xl font-bold text-blue-600">${overview.totalRemaining.toLocaleString()}</p>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {overview.totalRemaining > 0 ? "Available to spend" : "Over budget"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
