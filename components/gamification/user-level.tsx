"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, TrendingUp } from "lucide-react"

interface UserLevel {
  currentLevel: string
  currentPoints: number
  nextLevelPoints: number
  totalPointsForNextLevel: number
  levelBenefits: string[]
  recentAchievements: string[]
}

export function UserLevel() {
  const [levelData, setLevelData] = useState<UserLevel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLevelData() {
      try {
        const response = await fetch("/api/gamification/level")
        if (response.ok) {
          const data = await response.json()
          setLevelData(data)
        }
      } catch (error) {
        console.error("Error fetching level data:", error)
        // Fallback data
        setLevelData({
          currentLevel: "Gold Saver",
          currentPoints: 2450,
          nextLevelPoints: 550,
          totalPointsForNextLevel: 3000,
          levelBenefits: [
            "Advanced analytics dashboard",
            "Priority customer support",
            "Exclusive investment insights",
            "Custom budget categories",
          ],
          recentAchievements: [
            "Completed 30-day savings streak",
            "Reached monthly budget goal",
            "Added 5 new transactions",
          ],
        })
      } finally {
        setLoading(false)
      }
    }

    fetchLevelData()
  }, [])

  if (loading || !levelData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Level</CardTitle>
          <CardDescription>Track your progress and unlock rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-20 animate-pulse bg-muted rounded" />
            <div className="h-4 animate-pulse bg-muted rounded" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-6 animate-pulse bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const progressPercentage = (levelData.currentPoints / levelData.totalPointsForNextLevel) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          Your Level
        </CardTitle>
        <CardDescription>Track your progress and unlock rewards</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="h-8 w-8 text-yellow-600" />
            <h3 className="text-2xl font-bold">{levelData.currentLevel}</h3>
          </div>
          <p className="text-muted-foreground">
            {levelData.currentPoints} / {levelData.totalPointsForNextLevel} points
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress to next level</span>
            <span>{levelData.nextLevelPoints} points to go</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Star className="h-4 w-4 text-blue-600" />
            Level Benefits
          </h4>
          <div className="space-y-2">
            {levelData.levelBenefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            Recent Achievements
          </h4>
          <div className="space-y-2">
            {levelData.recentAchievements.map((achievement, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {achievement}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
