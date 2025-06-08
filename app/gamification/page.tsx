import { Suspense } from "react"
import { GamificationHeader } from "@/components/gamification/gamification-header"
import { UserLevel } from "@/components/gamification/user-level"
import { BadgeCollection } from "@/components/gamification/badge-collection"
import { Challenges } from "@/components/gamification/challenges"
import { Leaderboard } from "@/components/gamification/leaderboard"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

export default function GamificationPage() {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <GamificationHeader />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2 space-y-4">
              <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                <UserLevel />
              </Suspense>
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <Challenges />
              </Suspense>
            </div>
            <div className="space-y-4">
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <BadgeCollection />
              </Suspense>
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <Leaderboard />
              </Suspense>
            </div>
          </div>
        </div>
      </SidebarInset>
    </>
  )
}
