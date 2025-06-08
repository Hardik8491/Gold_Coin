"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CreditCard, PiggyBank, TrendingUp, Plus, Eye, EyeOff } from "lucide-react"

interface Account {
  id: string
  name: string
  type: "checking" | "savings" | "credit" | "investment"
  balance: number
  currency: string
  institution?: string
  isActive: boolean
}

const accountIcons = {
  checking: CreditCard,
  savings: PiggyBank,
  credit: CreditCard,
  investment: TrendingUp,
}

const accountColors = {
  checking: "bg-blue-500",
  savings: "bg-green-500",
  credit: "bg-red-500",
  investment: "bg-purple-500",
}

export function AccountsOverview() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [showBalances, setShowBalances] = useState(true)

  useEffect(() => {
    async function fetchAccounts() {
      try {
        const response = await fetch("/api/accounts")
        if (response.ok) {
          const data = await response.json()
          setAccounts(data.accounts)
        }
      } catch (error) {
        console.error("Error fetching accounts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAccounts()
  }, [])

  const totalBalance = accounts.reduce((sum, account) => {
    if (account.type === "credit") {
      return sum - account.balance // Credit balances are negative
    }
    return sum + account.balance
  }, 0)

  if (loading) {
    return (
      <Card variant="hover">
        <CardHeader>
          <CardTitle>Accounts Overview</CardTitle>
          <CardDescription>Your financial accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="hover">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Accounts Overview</CardTitle>
            <CardDescription>Your financial accounts</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowBalances(!showBalances)} className="h-8 w-8 p-0">
              {showBalances ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Account
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Total Balance */}
          <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Net Worth</p>
                <p className="text-2xl font-bold">{showBalances ? `$${totalBalance.toLocaleString()}` : "••••••"}</p>
              </div>
              <Badge variant="success" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2.5%
              </Badge>
            </div>
          </div>

          {/* Individual Accounts */}
          <div className="space-y-3">
            {accounts.map((account) => {
              const IconComponent = accountIcons[account.type]
              const iconColor = accountColors[account.type]

              return (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-border hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${iconColor}`}>
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{account.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" size="sm">
                          {account.type}
                        </Badge>
                        {account.institution && (
                          <span className="text-xs text-muted-foreground">{account.institution}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-medium text-sm ${
                        account.type === "credit"
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {showBalances
                        ? account.type === "credit"
                          ? `-$${account.balance.toLocaleString()}`
                          : `$${account.balance.toLocaleString()}`
                        : "••••••"}
                    </p>
                    <p className="text-xs text-muted-foreground">{account.currency}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {accounts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No accounts found</p>
              <p className="text-xs">Add your first account to get started</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
