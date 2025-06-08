import { Suspense } from "react"
import { ReportsHeader } from "@/components/reports/reports-header"
import { ReportGenerator } from "@/components/reports/report-generator"
import { ReportViewer } from "@/components/reports/report-viewer"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"

export default function ReportsPage() {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <ReportsHeader />
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-1">
              <ReportGenerator />
            </div>
            <div className="md:col-span-3">
              <Suspense fallback={<div>Loading report...</div>}>
                <ReportViewer />
              </Suspense>
            </div>
          </div>
        </div>
      </SidebarInset>
    </>
  )
}
