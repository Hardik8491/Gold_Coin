import { Suspense } from "react"
import { AIAssistantHeader } from "@/components/ai-assistant/ai-assistant-header"
import { ChatInterface } from "@/components/ai-assistant/chat-interface"
import { AIInsightsDashboard } from "@/components/ai-assistant/ai-insights-dashboard"
import { ReceiptScanner } from "@/components/ai-assistant/receipt-scanner"
import { TaxRecommendations } from "@/components/ai-assistant/tax-recommendations"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AIAssistantPage() {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <AIAssistantHeader />
          <Tabs defaultValue="chat" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="chat">AI Chat</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="scanner">Receipt Scanner</TabsTrigger>
              <TabsTrigger value="tax">Tax Helper</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="space-y-4">
              <Suspense fallback={<div>Loading chat...</div>}>
                <ChatInterface />
              </Suspense>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <Suspense fallback={<div>Loading insights...</div>}>
                <AIInsightsDashboard />
              </Suspense>
            </TabsContent>

            <TabsContent value="scanner" className="space-y-4">
              <ReceiptScanner />
            </TabsContent>

            <TabsContent value="tax" className="space-y-4">
              <Suspense fallback={<div>Loading tax recommendations...</div>}>
                <TaxRecommendations />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </>
  )
}
