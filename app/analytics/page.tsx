import { Suspense } from "react"
import { AnalyticsHeader } from "@/components/analytics/analytics-header"
import { SpendingChart } from "@/components/analytics/spending-chart"
import { CategoryBreakdown } from "@/components/analytics/category-breakdown"
import { TrendAnalysis } from "@/components/analytics/trend-analysis"
import { FinancialHealth } from "@/components/analytics/financial-health"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

export default function AnalyticsPage() {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <AnalyticsHeader />
          <div className="grid gap-4 md:grid-cols-2">
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <SpendingChart />
            </Suspense>
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <CategoryBreakdown />
            </Suspense>
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <TrendAnalysis />
            </Suspense>
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <FinancialHealth />
            </Suspense>
          </div>
        </div>
      </SidebarInset>
    </>
  )
}
