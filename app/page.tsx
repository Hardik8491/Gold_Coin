"use client"

import { useUser } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { AccountsOverview } from "@/components/dashboard/accounts-overview"
import { OnboardingCheck } from "@/components/auth/onboarding-check"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { AIInsights } from "@/components/dashboard/ai-insights"
import { GoalsProgress } from "@/components/dashboard/goals-progress"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarClock, CreditCard, LineChart, Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { BudgetTrackerChart } from "@/components/dashboard/budget-tracker-chart"
import { AnalyticsOverview } from "@/components/dashboard/analytics-overview"

export default function HomePage() {
  const { user, isLoaded } = useUser()

  // Show loading skeleton while checking auth
  if (!isLoaded) {
    return (
      <div className="flex h-screen">
        <div className="w-64 border-r bg-muted/40">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="flex-1 p-6">
          <div className="space-y-6">
            <Skeleton className="h-16 w-full" />
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2 space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
                <Skeleton className="h-96 w-full" />
              </div>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    redirect("/sign-in")
    return null
  }

  return (
    <>
      <OnboardingCheck />
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DashboardHeader />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {/* Welcome Section */}
            <div className="rounded-lg bg-gradient-to-r from-amber-500 to-yellow-300 p-6 text-black">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Welcome back, {user.firstName || "User"}! 👋</h1>
                  <p className="text-black/80">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="text-right">
                    <p className="text-sm text-black/70">Here's what's happening with your finances today</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid auto-rows-min gap-6 md:grid-cols-3">
              {/* Left Column - Main Content */}
              <div className="md:col-span-2 space-y-6">
                <DashboardOverview />

                {/* Budget Tracker Chart */}
                <BudgetTrackerChart />

                <RecentTransactions />
              </div>

              {/* Right Column - Sidebar Content */}
              <div className="space-y-4">
                <AccountsOverview />
                <QuickActions />
                <AIInsights />
                <GoalsProgress />
              </div>
            </div>

            {/* Analytics Section */}
            <div className="mt-8">
              <AnalyticsOverview />
            </div>

            {/* Bottom Section - Additional Insights */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
              <Card variant="hover">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-amber-500" />
                    Upcoming Bills
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Due this week</p>
                </CardContent>
              </Card>

              <Card variant="hover">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-amber-500" />
                    Active Budgets
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">4</div>
                  <div className="flex items-center">
                    <Badge variant="success" size="sm">
                      2 on track
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card variant="hover">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <LineChart className="h-4 w-4 text-amber-500" />
                    Savings Rate
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">18.2%</div>
                  <Badge variant="success" size="sm">
                    +2.4%
                  </Badge>
                </CardContent>
              </Card>

              <Card variant="hover">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Bell className="h-4 w-4 text-amber-500" />
                    Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">2</div>
                  <Badge variant="warning" size="sm">
                    Budget alerts
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
