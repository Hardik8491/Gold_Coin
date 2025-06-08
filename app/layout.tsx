import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "@/components/ui/toaster"
import { UserSync } from "@/components/auth/user-sync"
import "./globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GoldCoin - Smart Finance Tracker",
  description: "AI-powered personal finance management with real-time insights",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <SidebarProvider>
      <html lang="en">
        <body className={inter.className}>
          <UserSync />
          {children}
          <Toaster />
        </body>
      </html>
      </SidebarProvider>
    </ClerkProvider>
  )
}
