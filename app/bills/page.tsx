import { Suspense } from "react"
import { BillsHeader } from "@/components/bills/bills-header"
import { BillsList } from "@/components/bills/bills-list"
import { BillsCalendar } from "@/components/bills/bills-calendar"
import { UpcomingBills } from "@/components/bills/upcoming-bills"
import { CreateBillDialog } from "@/components/bills/create-bill-dialog"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

export default function BillsPage() {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <BillsHeader />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2 space-y-4">
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <BillsCalendar />
              </Suspense>
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <BillsList />
              </Suspense>
            </div>
            <div className="space-y-4">
              <CreateBillDialog />
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <UpcomingBills />
              </Suspense>
            </div>
          </div>
        </div>
      </SidebarInset>
    </>
  )
}
