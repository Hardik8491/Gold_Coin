"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, Trophy, Coins, PiggyBank, Car, Home, ArrowRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

interface Goal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  progress: number
  category: string
  deadline: string
}

const categoryIcons: Record<string, any> = {
  Savings: PiggyBank,
  Travel: Car,
  Technology: Coins,
  Housing: Home,
  Education: Trophy,
  Emergency: Target,
  Investment: Trophy,
  Other: Target,
}

const categoryColors: Record<string, string> = {
  Savings: "bg-blue-500",
  Travel: "bg-purple-500",
  Technology: "bg-green-500",
  Housing: "bg-orange-500",
  Education: "bg-indigo-500",
  Emergency: "bg-red-500",
  Investment: "bg-yellow-500",
  Other: "bg-gray-500",
}

export function GoalsProgress() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGoals() {
      try {
        const response = await fetch("/api/goals?status=active")
        if (response.ok) {
          const data = await response.json()
          setGoals(data?.goals?.slice(0, 3)) // Show top 3 goals
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
      <Card variant="hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Goals Progress
          </CardTitle>
          <CardDescription>Track your financial milestones</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-md" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-5 w-10" />
              </div>
              <Skeleton className="h-2 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (goals?.length === 0) {
    return (
      <Card variant="hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Goals Progress
          </CardTitle>
          <CardDescription>Track your financial milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No active goals found</p>
            <p className="text-xs">Create your first financial goal to get started</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="hover">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Goals Progress
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            View All
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
        <CardDescription>Track your financial milestones</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals?.map((goal) => {
          const IconComponent = categoryIcons[goal.category] || Target
          const iconColor = categoryColors[goal.category] || "bg-gray-500"
          const progress = Math.min(goal.progress, 100)

          // Determine progress variant based on percentage
          let progressVariant: "default" | "success" | "warning" | "danger" = "default"
          if (progress >= 75) progressVariant = "success"
          else if (progress >= 40) progressVariant = "default"
          else progressVariant = "warning"

          return (
            <div
              key={goal.id}
              className="space-y-2 p-3 rounded-lg border bg-card/50 hover:bg-accent/5 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md ${iconColor}`}>
                    <IconComponent className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{goal.title}</p>
                    <p className="text-xs text-muted-foreground">{goal.category}</p>
                  </div>
                </div>
                <Badge variant={progress >= 75 ? "success" : "outline"} className="text-xs">
                  {Math.round(progress)}%
                </Badge>
              </div>
              <Progress value={progress} className="h-2" variant={progressVariant} />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>${goal.currentAmount.toLocaleString()}</span>
                <span>${goal.targetAmount.toLocaleString()}</span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
