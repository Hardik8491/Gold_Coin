"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, PauseCircle, PlayCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"

interface Budget {
  id: string
  name: string
  period: string
  totalAmount: number
  totalSpent: number
  totalRemaining: number
  startDate: string
  endDate: string
  status: string
  categories: Array<{
    name: string
    budgeted: number
    spent: number
    remaining: number
    color?: string
  }>
}

export function BudgetsList() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBudgets()
  }, [])

  async function fetchBudgets() {
    try {
      const response = await fetch("/api/budgets")
      if (response.ok) {
        const data = await response.json()
        setBudgets(data.budgets)
      }
    } catch (error) {
      console.error("Error fetching budgets:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (budgetId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchBudgets()
      }
    } catch (error) {
      console.error("Error updating budget status:", error)
    }
  }

  const handleDelete = async (budgetId: string) => {
    if (!confirm("Are you sure you want to delete this budget?")) return

    try {
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchBudgets()
      }
    } catch (error) {
      console.error("Error deleting budget:", error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Budgets</CardTitle>
          <CardDescription>Manage your spending budgets</CardDescription>
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
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
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
        <CardTitle>Your Budgets</CardTitle>
        <CardDescription>Manage your spending budgets</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {budgets.map((budget) => {
            const utilizationPercentage = (budget.totalSpent / budget.totalAmount) * 100
            const isOverBudget = utilizationPercentage > 100
            const isNearLimit = utilizationPercentage > 80

            return (
              <div key={budget.id} className="p-4 border rounded-lg space-y-4">
                {/* Budget Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{budget.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(budget.startDate), "MMM dd")} -{" "}
                      {format(new Date(budget.endDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={budget.status === "active" ? "default" : "secondary"}>{budget.status}</Badge>
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
                          onClick={() =>
                            handleStatusChange(budget.id, budget.status === "active" ? "inactive" : "active")
                          }
                        >
                          {budget.status === "active" ? (
                            <>
                              <PauseCircle className="h-4 w-4 mr-2" />
                              Pause
                            </>
                          ) : (
                            <>
                              <PlayCircle className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(budget.id)} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Overall Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span className={isOverBudget ? "text-red-600" : "text-muted-foreground"}>
                      ${budget.totalSpent.toLocaleString()} / ${budget.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(utilizationPercentage, 100)}
                    className={`h-2 ${isOverBudget ? "bg-red-100" : isNearLimit ? "bg-yellow-100" : ""}`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{Math.round(utilizationPercentage)}% used</span>
                    <span>${budget.totalRemaining.toLocaleString()} remaining</span>
                  </div>
                </div>

                {/* Category Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {budget.categories.slice(0, 4).map((category, index) => {
                    const categoryUtilization = (category.spent / category.budgeted) * 100
                    const categoryOverBudget = categoryUtilization > 100

                    return (
                      <div key={index} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">{category.name}</span>
                          <Badge variant={categoryOverBudget ? "destructive" : "outline"} className="text-xs">
                            {Math.round(categoryUtilization)}%
                          </Badge>
                        </div>
                        <Progress value={Math.min(categoryUtilization, 100)} className="h-1 mb-1" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>${category.spent.toFixed(2)}</span>
                          <span>${category.budgeted.toFixed(2)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {budget.categories.length > 4 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{budget.categories.length - 4} more categories
                  </p>
                )}
              </div>
            )
          })}

          {budgets.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No budgets found</p>
              <p className="text-sm">Create your first budget to start tracking your spending</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
