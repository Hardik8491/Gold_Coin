"use client"

import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function OnboardingCheck() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function checkOnboardingStatus() {
      if (!isLoaded || !user) return

      try {
        const response = await fetch("/api/users/profile")
        if (response.ok) {
          const profile = await response.json()

          // Check if user needs onboarding
          if (!profile.onboardingCompleted) {
            router.push("/onboarding")
            return
          }
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error)
      } finally {
        setChecking(false)
      }
    }

    checkOnboardingStatus()
  }, [user, isLoaded, router])

  // Don't render anything during check
  if (checking) return null

  return null
}
