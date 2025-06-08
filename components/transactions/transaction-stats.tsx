"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface TransactionStats {
  totalIncome: number
  totalExpenses: number
  netIncome: number
  transactionCount: number
  avgTransactionAmount: number
  monthlyChange: number
}

export function TransactionStats() {
  const [stats, setStats] = useState<TransactionStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/transactions/stats")
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Error fetching transaction stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
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

  if (!stats) return null

  const statCards = [
    {
      title: "Total Income",
      value: `$${stats.totalIncome.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-green-600",
      description: "This month",
    },
    {
      title: "Total Expenses",
      value: `$${stats.totalExpenses.toLocaleString()}`,
      icon: TrendingDown,
      color: "text-red-600",
      description: "This month",
    },
    {
      title: "Net Income",
      value: `$${stats.netIncome.toLocaleString()}`,
      icon: DollarSign,
      color: stats.netIncome >= 0 ? "text-green-600" : "text-red-600",
      description: "Income - Expenses",
    },
    {
      title: "Transactions",
      value: stats.transactionCount.toString(),
      icon: CreditCard,
      color: "text-blue-600",
      description: `Avg: $${stats.avgTransactionAmount.toFixed(2)}`,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
