export interface Transaction {
  id: string
  type: "income" | "expense" | "transfer"
  category: string
  merchant: string
  amount: number
  date: string
  description?: string
  account: string
  tags?: string[]
  recurring?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Budget {
  id: string
  name: string
  period: "weekly" | "monthly" | "yearly"
  totalAmount: number
  categories: BudgetCategory[]
  startDate: string
  endDate: string
  status: "active" | "inactive" | "completed"
  createdAt?: string
  updatedAt?: string
}

export interface BudgetCategory {
  name: string
  budgeted: number
  spent: number
  remaining: number
  color?: string
}

export interface Goal {
  id: string
  title: string
  description?: string
  targetAmount: number
  currentAmount: number
  category: string
  deadline: string
  priority: "low" | "medium" | "high"
  status: "active" | "completed" | "paused"
  milestones?: Milestone[]
  createdAt?: string
  updatedAt?: string
}

export interface Milestone {
  amount: number
  reached: boolean
  date: string | null
}

export interface AIInsight {
  type: "spending_pattern" | "savings_opportunity" | "goal_progress" | "budget_alert"
  title: string
  message: string
  severity: "info" | "warning" | "success" | "error"
  actionable: boolean
  suggestions: string[]
  category?: string
  impact: "low" | "medium" | "high"
  confidence: number
}

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  preferences: UserPreferences
  createdAt: string
  updatedAt: string
}

export interface UserPreferences {
  currency: string
  timezone: string
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

export interface Account {
  id: string
  name: string
  type: "checking" | "savings" | "credit" | "investment"
  balance: number
  currency: string
  institution?: string
  lastSynced?: string
  isActive: boolean
}

export interface Bill {
  id: string
  name: string
  amount: number
  dueDate: string
  category: string
  recurring: boolean
  frequency?: "weekly" | "monthly" | "quarterly" | "yearly"
  status: "pending" | "paid" | "overdue"
  account: string
  reminders: boolean
  createdAt: string
}

export interface GamificationData {
  level: number
  experience: number
  coins: number
  badges: Badge[]
  streaks: {
    current: number
    longest: number
    type: "daily" | "weekly" | "monthly"
  }
  challenges: Challenge[]
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  rarity: "common" | "rare" | "epic" | "legendary"
  earnedAt?: string
}

export interface Challenge {
  id: string
  title: string
  description: string
  type: "savings" | "spending" | "budget" | "goal"
  target: number
  progress: number
  reward: {
    coins: number
    experience: number
    badge?: string
  }
  startDate: string
  endDate: string
  status: "active" | "completed" | "failed"
}
