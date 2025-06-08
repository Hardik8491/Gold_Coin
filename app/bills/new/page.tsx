import { Suspense } from "react"
import { CreateBillForm } from "@/components/bills/create-bill-form"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { ArrowLeft, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NewBillPage() {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Header */}
          <div className="flex items-center gap-4 py-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/bills">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Bills
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                Schedule New Bill
              </h1>
              <p className="text-muted-foreground">Set up a recurring bill or payment reminder</p>
            </div>
          </div>

          {/* Form */}
          <div className="max-w-2xl">
            <Suspense fallback={<div>Loading...</div>}>
              <CreateBillForm />
            </Suspense>
          </div>
        </div>
      </SidebarInset>
    </>
  )
}
