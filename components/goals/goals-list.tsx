"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Plus, Target, Calendar, DollarSign } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface Goal {
  id: string
  title: string
  description?: string
  targetAmount: number
  currentAmount: number
  progress: number
  category: string
  deadline: string
  priority: string
  status: string
  milestones: Array<{
    amount: number
    reached: boolean
    date: string | null
  }>
}

export function GoalsList() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingGoal, setUpdatingGoal] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchGoals()
  }, [])

  async function fetchGoals() {
    try {
      const response = await fetch("/api/goals")
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

  const handleUpdateProgress = async (goalId: string, newAmount: number) => {
    setUpdatingGoal(goalId)
    try {
      const response = await fetch("/api/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId, currentAmount: newAmount }),
      })

      if (!response.ok) {
        throw new Error("Failed to update goal")
      }

      const updatedGoal = await response.json()

      // Check for milestone achievements
      const goal = goals.find((g) => g.id === goalId)
      if (goal) {
        const newMilestones = updatedGoal.milestones.filter(
          (m: any) =>
            m.reached && !goal.milestones.find((existing) => existing.amount === m.amount && existing.reached),
        )

        if (newMilestones.length > 0) {
          toast({
            title: "Milestone Reached! 🎉",
            description: `You've reached $${newMilestones[0].amount} for "${goal.title}"`,
          })
        }
      }

      fetchGoals()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update goal progress. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUpdatingGoal(null)
    }
  }

  const handleStatusChange = async (goalId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchGoals()
      }
    } catch (error) {
      console.error("Error updating goal status:", error)
    }
  }

  const handleDelete = async (goalId: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) return

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchGoals()
        toast({
          title: "Goal deleted",
          description: "Your goal has been deleted successfully.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete goal. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getDaysUntilDeadline = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Goals</CardTitle>
          <CardDescription>Track your financial milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-2 w-full mb-4" />
                <div className="grid grid-cols-3 gap-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Goals</CardTitle>
        <CardDescription>Track your financial milestones</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.map((goal) => {
            const daysUntilDeadline = getDaysUntilDeadline(goal.deadline)
            const isOverdue = daysUntilDeadline < 0
            const isNearDeadline = daysUntilDeadline <= 30 && daysUntilDeadline > 0

            return (
              <div key={goal.id} className="p-4 border rounded-lg space-y-4">
                {/* Goal Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{goal.title}</h3>
                      <Badge className={getPriorityColor(goal.priority)}>{goal.priority}</Badge>
                      <Badge variant={goal.status === "active" ? "default" : "secondary"}>{goal.status}</Badge>
                    </div>
                    {goal.description && <p className="text-sm text-muted-foreground mb-2">{goal.description}</p>}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {goal.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(goal.deadline), "MMM dd, yyyy")}
                        {isOverdue && <span className="text-red-600 ml-1">(Overdue)</span>}
                        {isNearDeadline && (
                          <span className="text-yellow-600 ml-1">({daysUntilDeadline} days left)</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(goal.id, goal.status === "active" ? "paused" : "active")}
                      >
                        {goal.status === "active" ? "Pause" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(goal.id)} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(goal.progress)}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>${goal.currentAmount.toLocaleString()}</span>
                    <span>${goal.targetAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Update Progress */}
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Add amount..."
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        const input = e.target as HTMLInputElement
                        const newAmount = goal.currentAmount + Number.parseFloat(input.value || "0")
                        if (newAmount >= 0) {
                          handleUpdateProgress(goal.id, newAmount)
                          input.value = ""
                        }
                      }
                    }}
                    disabled={updatingGoal === goal.id}
                  />
                  <Button
                    size="sm"
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).parentElement?.querySelector("input") as HTMLInputElement
                      const newAmount = goal.currentAmount + Number.parseFloat(input?.value || "0")
                      if (newAmount >= 0) {
                        handleUpdateProgress(goal.id, newAmount)
                        if (input) input.value = ""
                      }
                    }}
                    disabled={updatingGoal === goal.id}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Milestones */}
                {goal.milestones.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Milestones</h4>
                    <div className="flex gap-2 flex-wrap">
                      {goal.milestones.map((milestone, index) => (
                        <Badge key={index} variant={milestone.reached ? "default" : "outline"} className="text-xs">
                          ${milestone.amount.toLocaleString()}
                          {milestone.reached && " ✓"}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {goals.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No goals found</p>
              <p className="text-sm">Create your first financial goal to get started</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
