"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Filter, CalendarIcon, X, CreditCard } from "lucide-react"
import { format } from "date-fns"

const categories = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Travel",
  "Education",
  "Business",
  "Personal Care",
  "Gifts & Donations",
  "Investments",
  "Other",
]

interface Account {
  id: string
  name: string
  type: string
  balance: number
}

interface FilterState {
  category: string[]
  type: string
  accountId: string
  dateRange: { from?: Date; to?: Date }
  amountRange: { min?: number; max?: number }
  merchant: string
  tags: string[]
}

export function TransactionsFilters() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [filters, setFilters] = useState<FilterState>({
    category: [],
    type: "all",
    accountId: "all",
    dateRange: {},
    amountRange: {},
    merchant: "",
    tags: [],
  })

  const [activeFilters, setActiveFilters] = useState<string[]>([])

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await fetch("/api/accounts")
      if (response.ok) {
        const data = await response.json()
        setAccounts(data.accounts)
      }
    } catch (error) {
      console.error("Error fetching accounts:", error)
    }
  }

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked ? [...filters.category, category] : filters.category.filter((c) => c !== category)

    setFilters((prev) => ({ ...prev, category: newCategories }))
    updateActiveFilters()
  }

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    setFilters((prev) => ({ ...prev, dateRange: range }))
    updateActiveFilters()
  }

  const updateActiveFilters = () => {
    const active: string[] = []
    if (filters.category.length > 0) active.push(`Categories: ${filters.category.length}`)
    if (filters.type !== "all") active.push(`Type: ${filters.type}`)
    if (filters.accountId !== "all") {
      const account = accounts.find((a) => a.id === filters.accountId)
      active.push(`Account: ${account?.name || "Unknown"}`)
    }
    if (filters.dateRange.from || filters.dateRange.to) active.push("Date Range")
    if (filters.amountRange.min || filters.amountRange.max) active.push("Amount Range")
    if (filters.merchant) active.push(`Merchant: ${filters.merchant}`)
    setActiveFilters(active)
  }

  const clearFilters = () => {
    setFilters({
      category: [],
      type: "all",
      accountId: "all",
      dateRange: {},
      amountRange: {},
      merchant: "",
      tags: [],
    })
    setActiveFilters([])
  }

  const applyFilters = () => {
    // Emit filter change event or call parent callback
    const searchParams = new URLSearchParams()

    if (filters.category.length > 0) {
      searchParams.set("categories", filters.category.join(","))
    }
    if (filters.type !== "all") {
      searchParams.set("type", filters.type)
    }
    if (filters.accountId !== "all") {
      searchParams.set("accountId", filters.accountId)
    }
    if (filters.dateRange.from) {
      searchParams.set("startDate", filters.dateRange.from.toISOString())
    }
    if (filters.dateRange.to) {
      searchParams.set("endDate", filters.dateRange.to.toISOString())
    }
    if (filters.amountRange.min) {
      searchParams.set("minAmount", filters.amountRange.min.toString())
    }
    if (filters.amountRange.max) {
      searchParams.set("maxAmount", filters.amountRange.max.toString())
    }
    if (filters.merchant) {
      searchParams.set("merchant", filters.merchant)
    }

    // Update URL or trigger refetch
    window.history.pushState({}, "", `?${searchParams.toString()}`)
    window.location.reload()
  }

  return (
    <Card variant="hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="space-y-2">
            <Label>Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {filter}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={clearFilters} />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Account Filter */}
        <div className="space-y-2">
          <Label>Account</Label>
          <Select
            value={filters.accountId}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, accountId: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="All accounts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  All Accounts
                </div>
              </SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{account.name}</span>
                    <div className="flex items-center gap-2 ml-2">
                      <Badge variant="secondary" size="sm">
                        {account.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">${account.balance.toLocaleString()}</span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Transaction Type */}
        <div className="space-y-2">
          <Label>Transaction Type</Label>
          <Select value={filters.type} onValueChange={(value) => setFilters((prev) => ({ ...prev, type: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="income">💰 Income</SelectItem>
              <SelectItem value="expense">💸 Expense</SelectItem>
              <SelectItem value="transfer">🔄 Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Categories */}
        <div className="space-y-2">
          <Label>Categories</Label>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={category}
                  checked={filters.category.includes(category)}
                  onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                />
                <Label htmlFor={category} className="text-sm">
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label>Date Range</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, "LLL dd, y")} - {format(filters.dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(filters.dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={filters.dateRange.from}
                selected={filters.dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Amount Range */}
        <div className="space-y-2">
          <Label>Amount Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="minAmount" className="text-xs">
                Min
              </Label>
              <Input
                id="minAmount"
                type="number"
                placeholder="0.00"
                value={filters.amountRange.min || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    amountRange: { ...prev.amountRange, min: Number.parseFloat(e.target.value) || undefined },
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="maxAmount" className="text-xs">
                Max
              </Label>
              <Input
                id="maxAmount"
                type="number"
                placeholder="1000.00"
                value={filters.amountRange.max || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    amountRange: { ...prev.amountRange, max: Number.parseFloat(e.target.value) || undefined },
                  }))
                }
              />
            </div>
          </div>
        </div>

        {/* Merchant */}
        <div className="space-y-2">
          <Label htmlFor="merchant">Merchant</Label>
          <Input
            id="merchant"
            placeholder="Search merchant..."
            value={filters.merchant}
            onChange={(e) => setFilters((prev) => ({ ...prev, merchant: e.target.value }))}
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button onClick={applyFilters} className="w-full">
            Apply Filters
          </Button>
          <Button onClick={clearFilters} variant="outline" className="w-full">
            Clear All
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
