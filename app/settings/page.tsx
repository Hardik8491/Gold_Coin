import { Suspense } from "react"
import { SettingsHeader } from "@/components/settings/settings-header"
import { ProfileSettings } from "@/components/settings/profile-settings"
// import { NotificationSettings } from "@/components/settings/notification-settings"
// import { SecuritySettings } from "@/components/settings/security-settings"
// import { ConnectedAccounts } from "@/components/settings/connected-accounts"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SettingsPage() {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <SettingsHeader />
          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="accounts">Accounts</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="space-y-4">
              <Suspense fallback={<div>Loading...</div>}>
                <ProfileSettings />
              </Suspense>
            </TabsContent>
            <TabsContent value="notifications" className="space-y-4">
              {/* <NotificationSettings /> */}
            </TabsContent>
            <TabsContent value="security" className="space-y-4">
              {/* <SecuritySettings /> */}
            </TabsContent>
            <TabsContent value="accounts" className="space-y-4">
              <Suspense fallback={<div>Loading...</div>}>
                {/* <ConnectedAccounts /> */}
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </>
  )
}
