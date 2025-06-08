"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { ArrowUpRight, ArrowDownLeft, Car, Home, ShoppingBag, Utensils, Smartphone, Search, Filter } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Transaction {
  id: string
  type: "income" | "expense"
  category: string
  merchant: string
  amount: number
  date: string
  accountName: string
}

const categoryIcons: Record<string, any> = {
  "Food & Dining": Utensils,
  Transportation: Car,
  Shopping: ShoppingBag,
  Housing: Home,
  Entertainment: Smartphone,
  "Bills & Utilities": Home,
  Healthcare: Home,
  Travel: Car,
  Education: Home,
  Business: Home,
  "Personal Care": Home,
  "Gifts & Donations": Home,
  Investments: Home,
  Other: Home,
}

const categoryColors: Record<string, string> = {
  "Food & Dining": "bg-amber-500",
  Transportation: "bg-blue-500",
  Shopping: "bg-pink-500",
  Housing: "bg-purple-500",
  Entertainment: "bg-green-500",
  "Bills & Utilities": "bg-red-500",
  Healthcare: "bg-teal-500",
  Travel: "bg-indigo-500",
  Education: "bg-yellow-500",
  Business: "bg-gray-500",
  "Personal Care": "bg-rose-500",
  "Gifts & Donations": "bg-emerald-500",
  Investments: "bg-violet-500",
  Other: "bg-slate-500",
}

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const response = await fetch("/api/transactions?limit=10")
        if (response.ok) {
          const data = await response.json()
          setTransactions(data.transactions)
        }
      } catch (error) {
        console.error("Error fetching transactions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <Card variant="hover">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="text-right">
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

  return (
    <Card variant="hover">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest financial activity</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                className="pl-9 h-9 w-full sm:w-[180px] md:w-[200px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="h-9">
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
          </div>
        </div>
        {showFilters && (
          <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t">
            <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
              All
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-secondary/80">
              Income
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-secondary/80">
              Expense
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-secondary/80">
              Food & Dining
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-secondary/80">
              Shopping
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-secondary/80">
              Transportation
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => {
              const IconComponent = categoryIcons[transaction.category] || Home
              const iconColor = categoryColors[transaction.category] || "bg-gray-500"

              return (
                <div
                  key={transaction.id}
                  className="flex items-center space-x-4 p-3 rounded-lg border border-transparent hover:border-border hover:bg-accent/5 transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <div className={`flex h-full w-full items-center justify-center rounded-full ${iconColor}`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{transaction.merchant}</p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-medium ${
                        transaction.type === "income"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    <Badge
                      variant={transaction.type === "income" ? "success" : "warning"}
                      size="sm"
                      className="text-xs"
                    >
                      {transaction.type === "income" ? (
                        <ArrowDownLeft className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                      )}
                      {transaction.type}
                    </Badge>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p>No transactions found matching your search</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
