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
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Loader2, ArrowUpDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Account {
  id: string
  name: string
  type: string
  balance: number
  currency: string
}

export function TransferMoneyForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])

  const [formData, setFormData] = useState({
    fromAccountId: "",
    toAccountId: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
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
      }
    } catch (error) {
      console.error("Error fetching accounts:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.fromAccountId === formData.toAccountId) {
      toast({
        title: "Invalid transfer",
        description: "Cannot transfer to the same account.",
        variant: "destructive",
      })
      return
    }

    const fromAccount = accounts.find((acc) => acc.id === formData.fromAccountId)
    const amount = Number.parseFloat(formData.amount)

    if (fromAccount && amount > fromAccount.balance) {
      toast({
        title: "Insufficient funds",
        description: "Transfer amount exceeds available balance.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const transferData = {
        type: "transfer",
        accountId: formData.fromAccountId,
        toAccountId: formData.toAccountId,
        amount: amount,
        merchant: "Account Transfer",
        description: formData.description || "Money transfer between accounts",
        category: "Account Transfer",
        date: `${formData.date}T${formData.time}:00.000Z`,
        reference: formData.reference,
      }

      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transferData),
      })

      if (response.ok) {
        toast({
          title: "Transfer completed successfully!",
          description: `$${amount.toLocaleString()} transferred between accounts.`,
        })
        router.push("/transactions")
      } else {
        throw new Error("Failed to complete transfer")
      }
    } catch (error) {
      toast({
        title: "Transfer failed",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fromAccount = accounts.find((acc) => acc.id === formData.fromAccountId)
  const toAccount = accounts.find((acc) => acc.id === formData.toAccountId)
  const amount = Number.parseFloat(formData.amount) || 0

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Transfer Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Transfer Details
          </CardTitle>
          <CardDescription>Select accounts and enter transfer amount</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Account Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label>From Account *</Label>
              <Select
                value={formData.fromAccountId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, fromAccountId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="font-medium">{account.name}</div>
                          <div className="text-sm text-muted-foreground">{account.type}</div>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          ${account.balance.toLocaleString()}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fromAccount && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm">
                    <div className="font-medium">Available Balance</div>
                    <div className="text-lg font-bold text-green-600">
                      ${fromAccount.balance.toLocaleString()} {fromAccount.currency}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden md:flex justify-center items-center">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>

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
                    .filter((acc) => acc.id !== formData.fromAccountId)
                    .map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <div className="font-medium">{account.name}</div>
                            <div className="text-sm text-muted-foreground">{account.type}</div>
                          </div>
                          <Badge variant="secondary" className="ml-2">
                            ${account.balance.toLocaleString()}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {toAccount && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm">
                    <div className="font-medium">Current Balance</div>
                    <div className="text-lg font-bold">
                      ${toAccount.balance.toLocaleString()} {toAccount.currency}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>Transfer Amount *</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max={fromAccount?.balance || undefined}
              value={formData.amount}
              onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
              placeholder="0.00"
              className="text-lg"
              required
            />
            {fromAccount && amount > 0 && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Remaining balance: ${(fromAccount.balance - amount).toLocaleString()}</span>
                {amount > fromAccount.balance && <span className="text-red-500">Insufficient funds</span>}
              </div>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
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

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
          <CardDescription>Optional details for this transfer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="e.g., Monthly savings transfer, Emergency fund..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Reference Number</Label>
            <Input
              value={formData.reference}
              onChange={(e) => setFormData((prev) => ({ ...prev, reference: e.target.value }))}
              placeholder="Optional reference or memo"
            />
          </div>
        </CardContent>
      </Card>

      {/* Transfer Summary */}
      {fromAccount && toAccount && amount > 0 && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="text-green-700 dark:text-green-400">Transfer Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>From:</span>
                <span className="font-medium">{fromAccount.name}</span>
              </div>
              <div className="flex justify-between">
                <span>To:</span>
                <span className="font-medium">{toAccount.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-bold text-lg">${amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date(formData.date).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading || !formData.fromAccountId || !formData.toAccountId || !formData.amount}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing Transfer...
            </>
          ) : (
            <>
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Complete Transfer
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
