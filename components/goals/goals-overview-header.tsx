"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, Trophy, Calendar } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Goal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  progress: number
  category: string
  deadline: string
  priority: string
}

export function GoalsOverviewHeader() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGoals() {
      try {
        const response = await fetch("/api/goals?status=active")
        if (response.ok) {
          const data = await response.json()
          setGoals(data.goals)
        }
      } catch (error) {
        console.error("Error fetching goals:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchGoals()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-2 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (goals.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-4 w-4" />
            <span>No active goals</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalProgress = goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length
  const completedGoals = goals.filter((goal) => goal.progress >= 100).length
  const nearDeadline = goals.filter((goal) => {
    const deadline = new Date(goal.deadline)
    const now = new Date()
    const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilDeadline <= 30 && goal.progress < 100
  }).length

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-4">
          {/* Overall Progress */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-100 text-blue-600">
              <Target className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Overall Progress</span>
                <Badge variant="outline" className="text-xs">
                  {Math.round(totalProgress)}%
                </Badge>
              </div>
              <Progress value={totalProgress} className="h-2" />
            </div>
          </div>

          {/* Completed Goals */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-100 text-green-600">
              <Trophy className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">{completedGoals} Completed</p>
              <p className="text-xs text-muted-foreground">out of {goals.length} goals</p>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${nearDeadline > 0 ? "bg-yellow-100 text-yellow-600" : "bg-gray-100 text-gray-600"}`}
            >
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">{nearDeadline} Due Soon</p>
              <p className="text-xs text-muted-foreground">within 30 days</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
