"use client"

import { Bot, Sparkles, MessageSquare, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function AIAssistantHeader() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bot className="h-8 w-8 text-blue-600" />
            AI Assistant
          </h1>
          <p className="text-muted-foreground">Your intelligent financial companion powered by AI</p>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-yellow-500" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-2 p-4">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Chat Sessions</p>
              <p className="text-2xl font-bold">47</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-2 p-4">
            <Zap className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Insights Generated</p>
              <p className="text-2xl font-bold">156</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-2 p-4">
            <Sparkles className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Money Saved</p>
              <p className="text-2xl font-bold">$2,340</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
