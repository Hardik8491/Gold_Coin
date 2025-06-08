"use client"

import { useEffect } from "react"
import { useUser } from "@clerk/nextjs"

export function UserSync() {
  const { user, isLoaded } = useUser()

  useEffect(() => {
    const syncUser = async () => {
      if (isLoaded && user) {
        try {
          const response = await fetch("/api/users/sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          })

          if (!response.ok) {
            console.error("Failed to sync user")
          }
        } catch (error) {
          console.error("Error syncing user:", error)
        }
      }
    }

    syncUser()
  }, [isLoaded, user])

  return null // This component doesn't render anything
}
