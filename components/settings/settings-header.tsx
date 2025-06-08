"use client"

import { Settings, User, Shield, Bell, Palette } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function SettingsHeader() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-8 w-8 text-gray-600" />
            Settings
          </h1>
          <p className="text-muted-foreground">Manage your account preferences and application settings</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-2 p-4">
            <User className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Profile</p>
              <p className="text-lg font-bold">Complete</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-2 p-4">
            <Shield className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Security</p>
              <p className="text-lg font-bold">Strong</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-2 p-4">
            <Bell className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Notifications</p>
              <p className="text-lg font-bold">12 Active</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-2 p-4">
            <Palette className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Theme</p>
              <p className="text-lg font-bold">Light</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
