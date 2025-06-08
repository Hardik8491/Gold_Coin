"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Goal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  progress: number
  category: string
  deadline: string
}

export function GoalProgressHeader() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGoals() {
      try {
        const response = await fetch("/api/goals?status=active&limit=3")
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
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-2 w-24" />
        <Skeleton className="h-5 w-12" />
      </div>
    )
  }

  if (goals?.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Target className="h-4 w-4" />
        <span>No active goals</span>
      </div>
    )
  }

if(!goals){
 return ;
}
const primaryGoal = goals[0]
  const totalProgress = goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium">{primaryGoal.title}</span>
      </div>

      <div className="flex items-center gap-2">
        <Progress value={primaryGoal.progress} className="w-24 h-2" />
        <Badge variant="outline" className="text-xs">
          {Math.round(primaryGoal.progress)}%
        </Badge>
      </div>

      {goals.length > 1 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <TrendingUp className="h-3 w-3" />
          <span>+{goals.length - 1} more goals</span>
          <Badge variant="secondary" className="text-xs">
            {Math.round(totalProgress)}% avg
          </Badge>
        </div>
      )}
    </div>
  )
}
