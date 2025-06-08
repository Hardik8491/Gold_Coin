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
import { Calendar, DollarSign, Loader2, Bell } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Account {
  id: string
  name: string
  type: string
  balance: number
  currency: string
}

const billCategories = [
  { value: "utilities", label: "Utilities", icon: "⚡", examples: "Electricity, Gas, Water" },
  { value: "rent", label: "Rent/Mortgage", icon: "🏠", examples: "Housing payments" },
  { value: "insurance", label: "Insurance", icon: "🛡️", examples: "Health, Auto, Life" },
  { value: "subscriptions", label: "Subscriptions", icon: "📱", examples: "Netflix, Spotify, Software" },
  { value: "loans", label: "Loans", icon: "🏦", examples: "Student, Personal, Auto" },
  { value: "credit_cards", label: "Credit Cards", icon: "💳", examples: "Monthly payments" },
  { value: "internet", label: "Internet/Phone", icon: "📶", examples: "ISP, Mobile plans" },
  { value: "other", label: "Other", icon: "📄", examples: "Miscellaneous bills" },
]

const frequencies = [
  { value: "weekly", label: "Weekly", description: "Every week" },
  { value: "monthly", label: "Monthly", description: "Every month" },
  { value: "quarterly", label: "Quarterly", description: "Every 3 months" },
  { value: "yearly", label: "Yearly", description: "Every year" },
]

const reminderDays = [
  { value: "1", label: "1 day before" },
  { value: "3", label: "3 days before" },
  { value: "7", label: "1 week before" },
  { value: "14", label: "2 weeks before" },
]

export function CreateBillForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    amount: "",
    isFixedAmount: true,
    accountId: "",
    frequency: "monthly",
    nextDueDate: "",
    reminderDays: "3",
    autoPayEnabled: false,
    isActive: true,
    website: "",
    phoneNumber: "",
    accountNumber: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const billData = {
        ...formData,
        amount: formData.isFixedAmount ? Number.parseFloat(formData.amount) : null,
        reminderDays: Number.parseInt(formData.reminderDays),
      }

      const response = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(billData),
      })

      if (response.ok) {
        toast({
          title: "Bill scheduled successfully!",
          description: "Your recurring bill has been set up.",
        })
        router.push("/bills")
      } else {
        throw new Error("Failed to create bill")
      }
    } catch (error) {
      toast({
        title: "Error creating bill",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedCategory = billCategories.find((cat) => cat.value === formData.category)
  const selectedAccount = accounts.find((acc) => acc.id === formData.accountId)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Bill Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Bill Information
          </CardTitle>
          <CardDescription>Basic details about your recurring bill</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Bill Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Electric Bill, Netflix Subscription"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {billCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <div>
                        <div className="font-medium">{category.label}</div>
                        <div className="text-xs text-muted-foreground">{category.examples}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Additional notes about this bill..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Details
          </CardTitle>
          <CardDescription>Amount and payment information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Fixed Amount</Label>
              <p className="text-sm text-muted-foreground">Bill amount is the same each time</p>
            </div>
            <Switch
              checked={formData.isFixedAmount}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isFixedAmount: checked }))}
            />
          </div>

          {formData.isFixedAmount && (
            <div className="space-y-2">
              <Label>Amount *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                required={formData.isFixedAmount}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Payment Account *</Label>
            <Select
              value={formData.accountId}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, accountId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment account" />
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
          </div>
        </CardContent>
      </Card>

      {/* Schedule Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Settings
          </CardTitle>
          <CardDescription>When and how often this bill occurs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Frequency *</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, frequency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frequencies.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      <div>
                        <div className="font-medium">{freq.label}</div>
                        <div className="text-xs text-muted-foreground">{freq.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Next Due Date *</Label>
              <Input
                type="date"
                value={formData.nextDueDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, nextDueDate: e.target.value }))}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reminder Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Reminder Settings
          </CardTitle>
          <CardDescription>Get notified before your bill is due</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Reminder Time</Label>
            <Select
              value={formData.reminderDays}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, reminderDays: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reminderDays.map((reminder) => (
                  <SelectItem key={reminder.value} value={reminder.value}>
                    {reminder.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Pay (Future Feature)</Label>
              <p className="text-sm text-muted-foreground">Automatically pay this bill when due</p>
            </div>
            <Switch
              checked={formData.autoPayEnabled}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, autoPayEnabled: checked }))}
              disabled
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Optional details for managing this bill</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Account Number</Label>
            <Input
              value={formData.accountNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, accountNumber: e.target.value }))}
              placeholder="Your account number with this provider"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bill Summary */}
      {formData.name && formData.category && formData.nextDueDate && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="text-orange-700 dark:text-orange-400">Bill Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Bill Name:</span>
                <span className="font-medium">{formData.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Category:</span>
                <span className="font-medium">{selectedCategory?.label}</span>
              </div>
              {formData.isFixedAmount && formData.amount && (
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-bold text-lg">${Number.parseFloat(formData.amount).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Frequency:</span>
                <span className="font-medium">{frequencies.find((f) => f.value === formData.frequency)?.label}</span>
              </div>
              <div className="flex justify-between">
                <span>Next Due:</span>
                <span className="font-medium">{new Date(formData.nextDueDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Account:</span>
                <span className="font-medium">{selectedAccount?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Reminder:</span>
                <span className="font-medium">
                  {reminderDays.find((r) => r.value === formData.reminderDays)?.label}
                </span>
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
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating Bill...
            </>
          ) : (
            <>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Bill
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
