import { Suspense } from "react"
import { BudgetsHeader } from "@/components/budgets/budgets-header"
import { BudgetsList } from "@/components/budgets/budgets-list"
import { BudgetOverview } from "@/components/budgets/budget-overview"
import { CreateBudgetDialog } from "@/components/budgets/create-budget-dialog"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

export default function BudgetsPage() {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <BudgetsHeader />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2 space-y-4">
              <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                <BudgetOverview />
              </Suspense>
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <BudgetsList />
              </Suspense>
            </div>
            <div className="space-y-4">
              <CreateBudgetDialog />
            </div>
          </div>
        </div>
      </SidebarInset>
    </>
  )
}
