import { Suspense } from "react"
import { TransactionsHeader } from "@/components/transactions/transactions-header"
import { TransactionsList } from "@/components/transactions/transactions-list"
import { TransactionsFilters } from "@/components/transactions/transactions-filters"
import { TransactionStats } from "@/components/transactions/transaction-stats"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

export default function TransactionsPage() {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <TransactionsHeader />
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-3 space-y-4">
              <Suspense fallback={<Skeleton className="h-32 w-full" />}>
                <TransactionStats />
              </Suspense>
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <TransactionsList />
              </Suspense>
            </div>
            <div className="space-y-4">
              <TransactionsFilters />
            </div>
          </div>
        </div>
      </SidebarInset>
    </>
  )
}
