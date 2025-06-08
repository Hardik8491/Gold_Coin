import { Suspense } from "react"
import { GoalsHeader } from "@/components/goals/goals-header"
import { GoalsList } from "@/components/goals/goals-list"
import { GoalsOverview } from "@/components/goals/goals-overview"
import { CreateGoalDialog } from "@/components/goals/create-goal-dialog"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

export default function GoalsPage() {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <GoalsHeader />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2 space-y-4">
              <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                <GoalsOverview />
              </Suspense>
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <GoalsList />
              </Suspense>
            </div>
            <div className="space-y-4">
              <CreateGoalDialog />
            </div>
          </div>
        </div>
      </SidebarInset>
    </>
  )
}
