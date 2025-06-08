"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, ArrowLeft, CheckCircle, Plus, Trash2 } from "lucide-react"

interface Account {
  name: string
  type: "checking" | "savings" | "credit" | "investment"
  balance: number
  currency: string
  institution?: string
}

interface OnboardingData {
  firstName: string
  lastName: string
  currency: string
  timezone: string
  accounts: Account[]
  preferences: {
    notifications: {
      email: boolean
      push: boolean
      budgetAlerts: boolean
      goalReminders: boolean
      billReminders: boolean
    }
    privacy: {
      shareData: boolean
      analytics: boolean
    }
  }
}

const steps = [
  { id: 1, title: "Personal Info", description: "Tell us about yourself" },
  { id: 2, title: "Accounts Setup", description: "Add your financial accounts" },
  { id: 3, title: "Preferences", description: "Customize your experience" },
  { id: 4, title: "Complete", description: "You're all set!" },
]

const accountTypes = [
  { value: "checking", label: "Checking Account", icon: "💳" },
  { value: "savings", label: "Savings Account", icon: "🏦" },
  { value: "credit", label: "Credit Card", icon: "💰" },
  { value: "investment", label: "Investment Account", icon: "📈" },
]

const currencies = [
  { value: "USD", label: "US Dollar ($)" },
  { value: "EUR", label: "Euro (€)" },
  { value: "GBP", label: "British Pound (£)" },
  { value: "CAD", label: "Canadian Dollar (C$)" },
  { value: "AUD", label: "Australian Dollar (A$)" },
]

const timezones = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "UTC", label: "UTC" },
]

export default function OnboardingPage() {
  const { user } = useUser()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [data, setData] = useState<OnboardingData>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    currency: "USD",
    timezone: "America/New_York",
    accounts: [
      {
        name: "Main Checking",
        type: "checking",
        balance: 0,
        currency: "USD",
        institution: "",
      },
    ],
    preferences: {
      notifications: {
        email: true,
        push: true,
        budgetAlerts: true,
        goalReminders: true,
        billReminders: true,
      },
      privacy: {
        shareData: false,
        analytics: true,
      },
    },
  })

  const addAccount = () => {
    setData((prev) => ({
      ...prev,
      accounts: [
        ...prev.accounts,
        {
          name: "",
          type: "checking",
          balance: 0,
          currency: prev.currency,
          institution: "",
        },
      ],
    }))
  }

  const removeAccount = (index: number) => {
    if (data.accounts.length > 1) {
      setData((prev) => ({
        ...prev,
        accounts: prev.accounts.filter((_, i) => i !== index),
      }))
    }
  }

  const updateAccount = (index: number, field: keyof Account, value: any) => {
    setData((prev) => ({
      ...prev,
      accounts: prev.accounts.map((account, i) => (i === index ? { ...account, [field]: value } : account)),
    }))
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      // Complete user profile
      const profileResponse = await fetch("/api/users/profile/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          preferences: data.preferences,
        }),
      })

      if (!profileResponse.ok) {
        throw new Error("Failed to complete profile")
      }

      // Create accounts
      for (const account of data.accounts) {
        if (account.name.trim()) {
          await fetch("/api/accounts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(account),
          })
        }
      }

      // Send welcome email
      await fetch("/api/email/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          accountCount: data.accounts.filter((a) => a.name.trim()).length,
        }),
      })

      router.push("/")
    } catch (error) {
      console.error("Error completing onboarding:", error)
    } finally {
      setLoading(false)
    }
  }

  const progress = (currentStep / steps.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Welcome to GoldCoin! 🪙</h1>
          <p className="text-gray-600 dark:text-gray-400">Let's set up your financial dashboard in just a few steps</p>
        </div>

        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${step.id <= currentStep ? "text-amber-600" : "text-gray-400"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.id < currentStep
                      ? "bg-amber-600 text-white"
                      : step.id === currentStep
                        ? "bg-amber-100 text-amber-600 border-2 border-amber-600"
                        : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {step.id < currentStep ? <CheckCircle className="h-4 w-4" /> : step.id}
                </div>
                <span className="text-xs mt-1 hidden sm:block">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={data.firstName}
                      onChange={(e) => setData((prev) => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={data.lastName}
                      onChange={(e) => setData((prev) => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currency">Preferred Currency</Label>
                    <Select
                      value={data.currency}
                      onValueChange={(value) => setData((prev) => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={data.timezone}
                      onValueChange={(value) => setData((prev) => ({ ...prev, timezone: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((timezone) => (
                          <SelectItem key={timezone.value} value={timezone.value}>
                            {timezone.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Financial Accounts</h3>
                    <p className="text-sm text-muted-foreground">
                      Add your bank accounts, credit cards, and investment accounts
                    </p>
                  </div>
                  <Button onClick={addAccount} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Account
                  </Button>
                </div>

                <div className="space-y-4">
                  {data.accounts.map((account, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label htmlFor={`account-name-${index}`}>Account Name</Label>
                          <Input
                            id={`account-name-${index}`}
                            value={account.name}
                            onChange={(e) => updateAccount(index, "name", e.target.value)}
                            placeholder="e.g., Main Checking"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`account-type-${index}`}>Type</Label>
                          <Select value={account.type} onValueChange={(value) => updateAccount(index, "type", value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {accountTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.icon} {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor={`account-balance-${index}`}>Current Balance</Label>
                          <Input
                            id={`account-balance-${index}`}
                            type="number"
                            step="0.01"
                            value={account.balance}
                            onChange={(e) => updateAccount(index, "balance", Number.parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="flex items-end">
                          {data.accounts.length > 1 && (
                            <Button
                              onClick={() => removeAccount(index)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="mt-2">
                        <Label htmlFor={`account-institution-${index}`}>Institution (Optional)</Label>
                        <Input
                          id={`account-institution-${index}`}
                          value={account.institution || ""}
                          onChange={(e) => updateAccount(index, "institution", e.target.value)}
                          placeholder="e.g., Chase Bank"
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
                  <div className="space-y-3">
                    {Object.entries(data.preferences.notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={value}
                          onCheckedChange={(checked) =>
                            setData((prev) => ({
                              ...prev,
                              preferences: {
                                ...prev.preferences,
                                notifications: {
                                  ...prev.preferences.notifications,
                                  [key]: checked as boolean,
                                },
                              },
                            }))
                          }
                        />
                        <Label htmlFor={key} className="text-sm">
                          {key === "email" && "Email notifications"}
                          {key === "push" && "Push notifications"}
                          {key === "budgetAlerts" && "Budget alerts"}
                          {key === "goalReminders" && "Goal reminders"}
                          {key === "billReminders" && "Bill reminders"}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Privacy Settings</h3>
                  <div className="space-y-3">
                    {Object.entries(data.preferences.privacy).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={value}
                          onCheckedChange={(checked) =>
                            setData((prev) => ({
                              ...prev,
                              preferences: {
                                ...prev.preferences,
                                privacy: {
                                  ...prev.preferences.privacy,
                                  [key]: checked as boolean,
                                },
                              },
                            }))
                          }
                        />
                        <Label htmlFor={key} className="text-sm">
                          {key === "shareData" && "Share anonymized data for insights"}
                          {key === "analytics" && "Enable analytics and tracking"}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold">You're All Set! 🎉</h3>
                <p className="text-muted-foreground">
                  Your GoldCoin account is ready. You'll receive a welcome email with tips to get started.
                </p>
                <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">What's Next?</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Connect your bank accounts for automatic transaction import</li>
                    <li>• Set up your first budget to track spending</li>
                    <li>• Create financial goals to save for what matters</li>
                    <li>• Explore AI insights to optimize your finances</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              <Button
                onClick={handlePrevious}
                variant="outline"
                disabled={currentStep === 1}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              {currentStep < steps.length ? (
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && (!data.firstName || !data.lastName)) ||
                    (currentStep === 2 && data.accounts.every((account) => !account.name.trim()))
                  }
                  className="flex items-center"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleComplete} disabled={loading} className="flex items-center">
                  {loading ? "Setting up..." : "Complete Setup"}
                  <CheckCircle className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
