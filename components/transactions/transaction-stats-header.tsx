"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface TransactionStats {
  totalIncome: number
  totalExpenses: number
  netIncome: number
  transactionCount: number
}

export function TransactionStatsHeader() {
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
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  const statItems = [
    {
      label: "Income",
      value: `$${stats.totalIncome.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      label: "Expenses",
      value: `$${stats.totalExpenses.toLocaleString()}`,
      icon: TrendingDown,
      color: "text-red-600",
    },
    {
      label: "Net",
      value: `$${stats.netIncome.toLocaleString()}`,
      icon: DollarSign,
      color: stats.netIncome >= 0 ? "text-green-600" : "text-red-600",
    },
    {
      label: "Transactions",
      value: stats.transactionCount.toString(),
      icon: CreditCard,
      color: "text-blue-600",
    },
  ]

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-4 gap-4">
          {statItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className={`p-2 rounded-full bg-muted ${item.color}`}>
                <item.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
