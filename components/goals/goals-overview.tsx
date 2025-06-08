"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, Trophy, Calendar, TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface GoalsOverview {
  totalGoals: number
  activeGoals: number
  completedGoals: number
  totalTargetAmount: number
  totalCurrentAmount: number
  overallProgress: number
  goalsNearDeadline: number
  averageProgress: number
}

export function GoalsOverview() {
  const [overview, setOverview] = useState<GoalsOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOverview()
  }, [])

  async function fetchOverview() {
    try {
      const response = await fetch("/api/goals/overview")
      if (response.ok) {
        const data = await response.json()
        setOverview(data)
      }
    } catch (error) {
      console.error("Error fetching goals overview:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Goals Overview</CardTitle>
          <CardDescription>Your financial goals summary</CardDescription>
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
          <CardTitle>Goals Overview</CardTitle>
          <CardDescription>Your financial goals summary</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">No goals data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Goals Overview</CardTitle>
        <CardDescription>Your financial goals summary</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Overall Progress</h3>
            <Badge variant="outline">{Math.round(overview.overallProgress)}%</Badge>
          </div>

          <Progress value={overview.overallProgress} className="h-3" />

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>${overview.totalCurrentAmount.toLocaleString()} saved</span>
            <span>${overview.totalTargetAmount.toLocaleString()} target</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Active Goals</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{overview.activeGoals}</p>
            <p className="text-xs text-muted-foreground">out of {overview.totalGoals} total</p>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Completed</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{overview.completedGoals}</p>
            <p className="text-xs text-muted-foreground">goals achieved</p>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Due Soon</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{overview.goalsNearDeadline}</p>
            <p className="text-xs text-muted-foreground">within 30 days</p>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Avg Progress</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{Math.round(overview.averageProgress)}%</p>
            <p className="text-xs text-muted-foreground">across all goals</p>
          </div>
        </div>

        {/* Remaining Amount */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Remaining to Save</h4>
              <p className="text-sm text-muted-foreground">To reach all active goals</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                ${(overview.totalTargetAmount - overview.totalCurrentAmount).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                {overview.totalCurrentAmount > 0
                  ? `${Math.round((overview.totalCurrentAmount / overview.totalTargetAmount) * 100)}% complete`
                  : "Get started!"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
