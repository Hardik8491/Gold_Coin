import { Suspense } from "react";
import { CreateGoalForm } from "@/components/goals/create-goal-form";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { ArrowLeft, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NewGoalPage() {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Header */}
          <div className="flex items-center gap-4 py-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/goals">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Goals
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Target className="h-6 w-6" />
                Create Financial Goal
              </h1>
              <p className="text-muted-foreground">
                Set up a new savings goal to track your progress
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="max-w-2xl">
            <Suspense fallback={<div>Loading...</div>}>
              <CreateGoalForm />
            </Suspense>
          </div>
        </div>
      </SidebarInset>
    </>
  );
}
