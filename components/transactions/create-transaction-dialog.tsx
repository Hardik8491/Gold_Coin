"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, Upload, Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"

interface Account {
  id: string
  name: string
  type: string
  balance: number
  currency: string
}

interface TransactionFormData {
  accountId: string
  type: "income" | "expense" | "transfer"
  merchant: string
  amount: number
  date: string
  description: string
  category: string
  subcategory: string
  tags: string[]
  recurring: boolean
  sendEmail: boolean
}

const categories = {
  income: ["Salary", "Freelance", "Investment", "Business", "Gift", "Other"],
  expense: [
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
    "Other",
  ],
  transfer: ["Account Transfer", "Investment Transfer", "Savings Transfer"],
}

export function CreateTransactionDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [formData, setFormData] = useState<TransactionFormData>({
    accountId: "",
    type: "expense",
    merchant: "",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    description: "",
    category: "",
    subcategory: "",
    tags: [],
    recurring: false,
    sendEmail: true,
  })

  useEffect(() => {
    if (open) {
      fetchAccounts()
    }
  }, [open])

  const fetchAccounts = async () => {
    try {
      const response = await fetch("/api/accounts")
      if (response.ok) {
        const data = await response.json()
        setAccounts(data.accounts)
        // Set default account if none selected
        if (data.accounts.length > 0 && !formData.accountId) {
          setFormData((prev) => ({ ...prev, accountId: data.accounts[0].id }))
        }
      }
    } catch (error) {
      console.error("Error fetching accounts:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setOpen(false)
        // Reset form
        setFormData({
          accountId: accounts[0]?.id || "",
          type: "expense",
          merchant: "",
          amount: 0,
          date: new Date().toISOString().split("T")[0],
          description: "",
          category: "",
          subcategory: "",
          tags: [],
          recurring: false,
          sendEmail: true,
        })
        // Refresh the page to show new transaction
        window.location.reload()
      }
    } catch (error) {
      console.error("Error creating transaction:", error)
    } finally {
      setLoading(false)
    }
  }

  const selectedAccount = accounts.find((account) => account.id === formData.accountId)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Transaction
          </DialogTitle>
          <DialogDescription>
            Record a new financial transaction. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account Selection */}
          <div className="space-y-2">
            <Label htmlFor="account">Account *</Label>
            <Select
              value={formData.accountId}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, accountId: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an account" />
              </SelectTrigger>
              <SelectContent>
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
            {selectedAccount && (
              <Card className="p-3 bg-muted/50">
                <div className="flex items-center justify-between text-sm">
                  <span>Current Balance:</span>
                  <span className="font-medium">
                    ${selectedAccount.balance.toLocaleString()} {selectedAccount.currency}
                  </span>
                </div>
              </Card>
            )}
          </div>

          {/* Transaction Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Transaction Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "income" | "expense" | "transfer") =>
                setFormData((prev) => ({ ...prev, type: value, category: "" }))
              }
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">💰 Income</SelectItem>
                <SelectItem value="expense">💸 Expense</SelectItem>
                <SelectItem value="transfer">🔄 Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Merchant and Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="merchant">Merchant/Source *</Label>
              <Input
                id="merchant"
                value={formData.merchant}
                onChange={(e) => setFormData((prev) => ({ ...prev, merchant: e.target.value }))}
                placeholder="e.g., Starbucks, Salary, etc."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData((prev) => ({ ...prev, amount: Number.parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Category and Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories[formData.type].map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Optional notes about this transaction..."
              rows={3}
            />
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="recurring">Recurring Transaction</Label>
                <p className="text-xs text-muted-foreground">Mark if this transaction repeats regularly</p>
              </div>
              <Switch
                id="recurring"
                checked={formData.recurring}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, recurring: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sendEmail">Email Notification</Label>
                <p className="text-xs text-muted-foreground">Send confirmation email for this transaction</p>
              </div>
              <Switch
                id="sendEmail"
                checked={formData.sendEmail}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, sendEmail: checked }))}
              />
            </div>
          </div>

          {/* AI Features */}
          <Card className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium">AI Features</span>
            </div>
            <div className="space-y-2">
              <Button type="button" variant="outline" size="sm" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Scan Receipt
              </Button>
              <p className="text-xs text-muted-foreground">
                Upload a receipt to automatically fill transaction details
              </p>
            </div>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
