"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Wallet, AlertTriangle, CheckCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Budget {
  id: string
  name: string
  totalAmount: number
  totalSpent: number
  totalRemaining: number
  categories: Array<{
    name: string
    budgeted: number
    spent: number
    remaining: number
  }>
}

export function BudgetProgressHeader() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBudgets() {
      try {
        const response = await fetch("/api/budgets?status=active")
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

    fetchBudgets()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-2 w-full" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (budgets.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wallet className="h-4 w-4" />
            <span>No active budgets</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const primaryBudget = budgets[0]
  const utilizationPercentage = (primaryBudget.totalSpent / primaryBudget.totalAmount) * 100
  const isOverBudget = utilizationPercentage > 100
  const isNearLimit = utilizationPercentage > 80

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div
            className={`p-2 rounded-full ${isOverBudget ? "bg-red-100 text-red-600" : isNearLimit ? "bg-yellow-100 text-yellow-600" : "bg-green-100 text-green-600"}`}
          >
            {isOverBudget ? (
              <AlertTriangle className="h-4 w-4" />
            ) : isNearLimit ? (
              <Wallet className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{primaryBudget.name}</span>
              <span className="text-xs text-muted-foreground">
                ${primaryBudget.totalSpent.toLocaleString()} / ${primaryBudget.totalAmount.toLocaleString()}
              </span>
            </div>
            <Progress value={Math.min(utilizationPercentage, 100)} className="h-2" />
          </div>

          <Badge variant={isOverBudget ? "destructive" : isNearLimit ? "secondary" : "default"} className="text-xs">
            {Math.round(utilizationPercentage)}%
          </Badge>

          {budgets.length > 1 && (
            <Badge variant="outline" className="text-xs">
              +{budgets.length - 1} more
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
