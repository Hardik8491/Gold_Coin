"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award, Lock, Star } from "lucide-react"

interface BadgeItem {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
  earnedDate?: string
  rarity: "common" | "rare" | "epic" | "legendary"
  category: string
}

export function BadgeCollection() {
  const [badges, setBadges] = useState<BadgeItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBadges() {
      try {
        const response = await fetch("/api/gamification/badges")
        if (response.ok) {
          const data = await response.json()
          setBadges(data.badges)
        }
      } catch (error) {
        console.error("Error fetching badges:", error)
        // Fallback data
        setBadges([
          {
            id: "1",
            name: "First Steps",
            description: "Complete your first transaction",
            icon: "🎯",
            earned: true,
            earnedDate: "2024-01-01",
            rarity: "common",
            category: "Getting Started",
          },
          {
            id: "2",
            name: "Budget Master",
            description: "Stay within budget for 30 days",
            icon: "💰",
            earned: true,
            earnedDate: "2024-01-15",
            rarity: "rare",
            category: "Budgeting",
          },
          {
            id: "3",
            name: "Savings Streak",
            description: "Save money for 7 consecutive days",
            icon: "🔥",
            earned: true,
            earnedDate: "2024-01-10",
            rarity: "epic",
            category: "Savings",
          },
          {
            id: "4",
            name: "Goal Crusher",
            description: "Complete 5 financial goals",
            icon: "🏆",
            earned: false,
            rarity: "legendary",
            category: "Goals",
          },
          {
            id: "5",
            name: "Transaction Tracker",
            description: "Log 100 transactions",
            icon: "📊",
            earned: false,
            rarity: "rare",
            category: "Tracking",
          },
          {
            id: "6",
            name: "AI Assistant",
            description: "Use AI features 10 times",
            icon: "🤖",
            earned: true,
            earnedDate: "2024-01-20",
            rarity: "epic",
            category: "AI",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchBadges()
  }, [])

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-800"
      case "rare":
        return "bg-blue-100 text-blue-800"
      case "epic":
        return "bg-purple-100 text-purple-800"
      case "legendary":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const earnedBadges = badges.filter((badge) => badge.earned)
  const availableBadges = badges.filter((badge) => !badge.earned)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Badge Collection</CardTitle>
          <CardDescription>Earn badges by completing financial milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 animate-pulse bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-600" />
          Badge Collection
        </CardTitle>
        <CardDescription>
          {earnedBadges.length} of {badges.length} badges earned
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            Earned Badges ({earnedBadges.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {earnedBadges.map((badge) => (
              <div key={badge.id} className="p-4 border rounded-lg text-center space-y-2">
                <div className="text-3xl">{badge.icon}</div>
                <h5 className="font-semibold text-sm">{badge.name}</h5>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
                <Badge className={getRarityColor(badge.rarity)}>{badge.rarity}</Badge>
                {badge.earnedDate && (
                  <p className="text-xs text-muted-foreground">
                    Earned {new Date(badge.earnedDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Lock className="h-4 w-4 text-gray-500" />
            Available Badges ({availableBadges.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {availableBadges.map((badge) => (
              <div key={badge.id} className="p-4 border rounded-lg text-center space-y-2 opacity-60">
                <div className="text-3xl grayscale">{badge.icon}</div>
                <h5 className="font-semibold text-sm">{badge.name}</h5>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
                <Badge className={getRarityColor(badge.rarity)}>{badge.rarity}</Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
