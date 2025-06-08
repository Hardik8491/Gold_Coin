"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, CreditCard, PiggyBank, Target } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardData {
  overview: {
    totalBalance: number
    accountCount: number
    monthlySpending: number
    spendingChange: number
    budgetRemaining: number
    budgetUtilization: number
    goalsProgress: number
    transactionCount: number
  }
}

export function DashboardOverview() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch("/api/dashboard")
        if (response.ok) {
          const dashboardData = await response.json()
          setData(dashboardData)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} variant="hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) {
    return <div>Failed to load dashboard data</div>
  }

  const stats = [
    {
      title: "Total Balance",
      value: `$${data.overview.totalBalance.toLocaleString()}`,
      change: "+2.5%",
      trend: "up",
      icon: DollarSign,
      description: `Across ${data.overview.accountCount} accounts`,
      variant: "premium",
    },
    {
      title: "Monthly Spending",
      value: `$${data.overview.monthlySpending.toLocaleString()}`,
      change: `${data.overview.spendingChange >= 0 ? "+" : ""}${data.overview.spendingChange.toFixed(1)}%`,
      trend: data.overview.spendingChange <= 0 ? "down" : "up",
      icon: CreditCard,
      description: `${data.overview.transactionCount} transactions`,
      variant: "default",
    },
    {
      title: "Goals Progress",
      value: `${data.overview.goalsProgress.toFixed(1)}%`,
      change: "68%",
      trend: "up",
      icon: PiggyBank,
      description: "Average progress",
      variant: "default",
    },
    {
      title: "Budget Remaining",
      value: `$${data.overview.budgetRemaining.toLocaleString()}`,
      change: `${(100 - data.overview.budgetUtilization).toFixed(0)}%`,
      trend: data.overview.budgetUtilization < 80 ? "up" : "down",
      icon: Target,
      description: "This month",
      variant: "default",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={stat.title} variant={index === 0 ? "premium" : "hover"} className="relative overflow-hidden">
          <CardHeader className={index === 0 ? "variant-premium" : ""}>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${index === 0 ? "text-amber-600" : "text-muted-foreground"}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${index === 0 ? "gold-text" : ""}`}>{stat.value}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
              <Badge
                variant={stat.trend === "up" ? "success" : "warning"}
                size="sm"
                className="flex items-center gap-1"
              >
                {stat.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {stat.change}
              </Badge>
              <span>{stat.description}</span>
            </div>
          </CardContent>
          {index === 0 && (
            <div className="absolute top-0 right-0 w-20 h-20 -mt-10 -mr-10 rounded-full bg-amber-200/20 dark:bg-amber-800/20 blur-xl"></div>
          )}
        </Card>
      ))}
    </div>
  )
}
