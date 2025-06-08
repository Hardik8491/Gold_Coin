"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Upload, Sparkles, Camera, FileText, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Account {
  id: string
  name: string
  type: string
  balance: number
  currency: string
}

const categories = {
  income: ["Salary", "Freelance", "Investment", "Business", "Gift", "Bonus", "Other"],
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
    "Insurance",
    "Other",
  ],
  transfer: ["Account Transfer", "Investment Transfer", "Savings Transfer"],
}

export function CreateTransactionForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [aiProcessing, setAiProcessing] = useState(false)

  const [formData, setFormData] = useState({
    accountId: "",
    toAccountId: "",
    type: "expense" as "income" | "expense" | "transfer",
    merchant: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
    description: "",
    category: "",
    subcategory: "",
    tags: [] as string[],
    recurring: false,
    sendEmail: true,
    location: "",
    reference: "",
  })

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await fetch("/api/accounts")
      if (response.ok) {
        const data = await response.json()
        setAccounts(data.accounts)
        if (data.accounts.length > 0 && !formData.accountId) {
          setFormData((prev) => ({ ...prev, accountId: data.accounts[0].id }))
        }
      }
    } catch (error) {
      console.error("Error fetching accounts:", error)
    }
  }

  const handleAIReceiptScan = async (file: File) => {
    setAiProcessing(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append("receipt", file)

      const response = await fetch("/api/ai/receipt-scan", {
        method: "POST",
        body: formDataUpload,
      })

      if (response.ok) {
        const result = await response.json()
        setFormData((prev) => ({
          ...prev,
          merchant: result.merchant || prev.merchant,
          amount: result.amount?.toString() || prev.amount,
          category: result.category || prev.category,
          description: result.description || prev.description,
          date: result.date || prev.date,
        }))
        toast({
          title: "Receipt scanned successfully!",
          description: "Transaction details have been filled automatically.",
        })
      }
    } catch (error) {
      toast({
        title: "Error scanning receipt",
        description: "Please try again or enter details manually.",
        variant: "destructive",
      })
    } finally {
      setAiProcessing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const transactionData = {
        ...formData,
        amount: Number.parseFloat(formData.amount),
        date: `${formData.date}T${formData.time}:00.000Z`,
      }

      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionData),
      })

      if (response.ok) {
        toast({
          title: "Transaction created successfully!",
          description: "Your transaction has been recorded.",
        })
        router.push("/transactions")
      } else {
        throw new Error("Failed to create transaction")
      }
    } catch (error) {
      toast({
        title: "Error creating transaction",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedAccount = accounts.find((acc) => acc.id === formData.accountId)
  const toAccount = accounts.find((acc) => acc.id === formData.toAccountId)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* AI Receipt Scanner */}
      <Card className="border-dashed border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <Sparkles className="h-5 w-5" />
            AI Receipt Scanner
          </CardTitle>
          <CardDescription>Upload a receipt photo to automatically fill transaction details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={aiProcessing}
              onClick={() => document.getElementById("receipt-upload")?.click()}
            >
              {aiProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Receipt
                </>
              )}
            </Button>
            <Button type="button" variant="outline" size="sm">
              <Camera className="h-4 w-4 mr-2" />
              Take Photo
            </Button>
          </div>
          <input
            id="receipt-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleAIReceiptScan(file)
            }}
          />
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
          <CardDescription>Enter the basic information about this transaction</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Transaction Type */}
          <div className="space-y-2">
            <Label>Transaction Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "income" | "expense" | "transfer") =>
                setFormData((prev) => ({ ...prev, type: value, category: "" }))
              }
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

          {/* Account Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From Account *</Label>
              <Select
                value={formData.accountId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, accountId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{account.name}</span>
                        <Badge variant="secondary" className="ml-2">
                          ${account.balance.toLocaleString()}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedAccount && (
                <div className="text-sm text-muted-foreground">
                  Balance: ${selectedAccount.balance.toLocaleString()} {selectedAccount.currency}
                </div>
              )}
            </div>

            {formData.type === "transfer" && (
              <div className="space-y-2">
                <Label>To Account *</Label>
                <Select
                  value={formData.toAccountId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, toAccountId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts
                      .filter((acc) => acc.id !== formData.accountId)
                      .map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{account.name}</span>
                            <Badge variant="secondary" className="ml-2">
                              ${account.balance.toLocaleString()}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Merchant and Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {formData.type === "income" ? "Source" : formData.type === "transfer" ? "Description" : "Merchant"} *
              </Label>
              <Input
                value={formData.merchant}
                onChange={(e) => setFormData((prev) => ({ ...prev, merchant: e.target.value }))}
                placeholder={
                  formData.type === "income"
                    ? "e.g., Salary, Freelance"
                    : formData.type === "transfer"
                      ? "e.g., Savings transfer"
                      : "e.g., Starbucks, Amazon"
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Amount *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Category and Date/Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
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
              <Label>Date *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Details */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
          <CardDescription>Optional details to help track and categorize this transaction</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Add any additional notes about this transaction..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., New York, NY"
              />
            </div>
            <div className="space-y-2">
              <Label>Reference Number</Label>
              <Input
                value={formData.reference}
                onChange={(e) => setFormData((prev) => ({ ...prev, reference: e.target.value }))}
                placeholder="e.g., Invoice #, Check #"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Options */}
      <Card>
        <CardHeader>
          <CardTitle>Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Recurring Transaction</Label>
              <p className="text-sm text-muted-foreground">Mark if this transaction repeats regularly</p>
            </div>
            <Switch
              checked={formData.recurring}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, recurring: checked }))}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notification</Label>
              <p className="text-sm text-muted-foreground">Send confirmation email for this transaction</p>
            </div>
            <Switch
              checked={formData.sendEmail}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, sendEmail: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Create Transaction
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
