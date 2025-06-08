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
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Target, Loader2, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Account {
  id: string
  name: string
  type: string
  balance: number
  currency: string
}

const goalCategories = [
  { value: "emergency", label: "Emergency Fund", icon: "🚨", description: "3-6 months of expenses" },
  { value: "vacation", label: "Vacation", icon: "✈️", description: "Travel and leisure" },
  { value: "home", label: "Home Down Payment", icon: "🏠", description: "Real estate purchase" },
  { value: "car", label: "Car Purchase", icon: "🚗", description: "Vehicle purchase" },
  { value: "education", label: "Education", icon: "🎓", description: "School and courses" },
  { value: "retirement", label: "Retirement", icon: "🏖️", description: "Long-term savings" },
  { value: "investment", label: "Investment", icon: "📈", description: "Portfolio building" },
  { value: "debt", label: "Debt Payoff", icon: "💳", description: "Debt elimination" },
  { value: "wedding", label: "Wedding", icon: "💒", description: "Wedding expenses" },
  { value: "technology", label: "Technology", icon: "💻", description: "Gadgets and tech" },
  { value: "other", label: "Other", icon: "🎯", description: "Custom goal" },
]

const priorityLevels = [
  { value: "low", label: "Low Priority", color: "bg-gray-500" },
  { value: "medium", label: "Medium Priority", color: "bg-yellow-500" },
  { value: "high", label: "High Priority", color: "bg-red-500" },
]

export function CreateGoalForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAmount: "",
    currentAmount: "0",
    category: "",
    priority: "medium",
    deadline: "",
    linkedAccountId: "",
    autoContribute: false,
    contributionAmount: "",
    contributionFrequency: "monthly",
    isPublic: false,
    milestones: [] as { amount: number; description: string }[],
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
    setLoading(true)

    try {
      const goalData = {
        ...formData,
        targetAmount: Number.parseFloat(formData.targetAmount),
        currentAmount: Number.parseFloat(formData.currentAmount),
        contributionAmount: formData.contributionAmount ? Number.parseFloat(formData.contributionAmount) : null,
      }

      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalData),
      })

      if (response.ok) {
        toast({
          title: "Goal created successfully!",
          description: "Your financial goal has been set up.",
        })
        router.push("/goals")
      } else {
        throw new Error("Failed to create goal")
      }
    } catch (error) {
      toast({
        title: "Error creating goal",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedCategory = goalCategories.find((cat) => cat.value === formData.category)
  const targetAmount = Number.parseFloat(formData.targetAmount) || 0
  const currentAmount = Number.parseFloat(formData.currentAmount) || 0
  const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0
  const remainingAmount = targetAmount - currentAmount

  // Calculate time to goal based on contribution
  const contributionAmount = Number.parseFloat(formData.contributionAmount) || 0
  const monthsToGoal = contributionAmount > 0 ? Math.ceil(remainingAmount / contributionAmount) : 0

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Goal Basics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Goal Information
          </CardTitle>
          <CardDescription>Define your financial goal and target</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Goal Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Emergency Fund, Dream Vacation"
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
                {goalCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <div>
                        <div className="font-medium">{category.label}</div>
                        <div className="text-xs text-muted-foreground">{category.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Target Amount *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.targetAmount}
                onChange={(e) => setFormData((prev) => ({ ...prev, targetAmount: e.target.value }))}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Current Amount</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.currentAmount}
                onChange={(e) => setFormData((prev) => ({ ...prev, currentAmount: e.target.value }))}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Target Date</Label>
              <Input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-2">
              <Label>Priority Level</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityLevels.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${priority.color}`} />
                        {priority.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your goal and why it's important to you..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Progress Preview */}
      {targetAmount > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="text-blue-700 dark:text-blue-400">Goal Progress Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress.toFixed(1)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">${currentAmount.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Current</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">${remainingAmount.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Remaining</div>
              </div>
              <div>
                <div className="text-2xl font-bold">${targetAmount.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Target</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Auto Contribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Automatic Contributions
          </CardTitle>
          <CardDescription>Set up automatic contributions to reach your goal faster</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Auto Contribute</Label>
              <p className="text-sm text-muted-foreground">Automatically contribute to this goal</p>
            </div>
            <Switch
              checked={formData.autoContribute}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, autoContribute: checked }))}
            />
          </div>

          {formData.autoContribute && (
            <>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contribution Amount *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.contributionAmount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, contributionAmount: e.target.value }))}
                    placeholder="0.00"
                    required={formData.autoContribute}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Frequency *</Label>
                  <Select
                    value={formData.contributionFrequency}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, contributionFrequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Linked Account</Label>
                <Select
                  value={formData.linkedAccountId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, linkedAccountId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account for contributions" />
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
              </div>

              {contributionAmount > 0 && remainingAmount > 0 && (
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="text-sm">
                    <div className="font-medium text-green-700 dark:text-green-400">
                      Time to Goal: {monthsToGoal} months
                    </div>
                    <div className="text-muted-foreground">
                      At ${contributionAmount}/month, you'll reach your goal by{" "}
                      {new Date(Date.now() + monthsToGoal * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Additional Options */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Public Goal</Label>
              <p className="text-sm text-muted-foreground">Share this goal with friends and family for motivation</p>
            </div>
            <Switch
              checked={formData.isPublic}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPublic: checked }))}
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
              Creating Goal...
            </>
          ) : (
            <>
              <Target className="h-4 w-4 mr-2" />
              Create Goal
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
