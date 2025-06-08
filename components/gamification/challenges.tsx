"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, Clock, Gift } from "lucide-react"

interface Challenge {
  id: string
  title: string
  description: string
  type: "daily" | "weekly" | "monthly"
  progress: number
  target: number
  reward: string
  pointsReward: number
  expiresAt: string
  completed: boolean
}

export function Challenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchChallenges() {
      try {
        const response = await fetch("/api/gamification/challenges")
        if (response.ok) {
          const data = await response.json()
          setChallenges(data.challenges)
        }
      } catch (error) {
        console.error("Error fetching challenges:", error)
        // Fallback data
        setChallenges([
          {
            id: "1",
            title: "Daily Tracker",
            description: "Log 3 transactions today",
            type: "daily",
            progress: 2,
            target: 3,
            reward: "Transaction Master Badge",
            pointsReward: 50,
            expiresAt: "2024-01-08T23:59:59Z",
            completed: false,
          },
          {
            id: "2",
            title: "Budget Keeper",
            description: "Stay within budget this week",
            type: "weekly",
            progress: 5,
            target: 7,
            reward: "Budget Champion Badge",
            pointsReward: 200,
            expiresAt: "2024-01-14T23:59:59Z",
            completed: false,
          },
          {
            id: "3",
            title: "Savings Goal",
            description: "Save $500 this month",
            type: "monthly",
            progress: 350,
            target: 500,
            reward: "Savings Star Badge",
            pointsReward: 500,
            expiresAt: "2024-01-31T23:59:59Z",
            completed: false,
          },
          {
            id: "4",
            title: "AI Explorer",
            description: "Use AI assistant 5 times",
            type: "weekly",
            progress: 5,
            target: 5,
            reward: "AI Enthusiast Badge",
            pointsReward: 150,
            expiresAt: "2024-01-14T23:59:59Z",
            completed: true,
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchChallenges()
  }, [])

  const getTypeColor = (type: string) => {
    switch (type) {
      case "daily":
        return "bg-green-100 text-green-800"
      case "weekly":
        return "bg-blue-100 text-blue-800"
      case "monthly":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diff = expires.getTime() - now.getTime()

    if (diff <= 0) return "Expired"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h`
    return `${hours}h`
  }

  const claimReward = async (challengeId: string) => {
    try {
      await fetch(`/api/gamification/challenges/${challengeId}/claim`, {
        method: "POST",
      })
      setChallenges(
        challenges.map((challenge) => (challenge.id === challengeId ? { ...challenge, completed: true } : challenge)),
      )
    } catch (error) {
      console.error("Error claiming reward:", error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Challenges</CardTitle>
          <CardDescription>Complete challenges to earn rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const activeChallenges = challenges.filter((c) => !c.completed)
  const completedChallenges = challenges.filter((c) => c.completed)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Active Challenges
        </CardTitle>
        <CardDescription>Complete challenges to earn rewards and points</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {activeChallenges.map((challenge) => {
            const progressPercentage = (challenge.progress / challenge.target) * 100
            const isCompleted = challenge.progress >= challenge.target

            return (
              <div key={challenge.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{challenge.title}</h4>
                    <p className="text-sm text-muted-foreground">{challenge.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor(challenge.type)}>{challenge.type}</Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {getTimeRemaining(challenge.expiresAt)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>
                      {challenge.progress} / {challenge.target}
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Gift className="h-4 w-4 text-yellow-600" />
                    <span>{challenge.reward}</span>
                    <Badge variant="outline">+{challenge.pointsReward} pts</Badge>
                  </div>

                  {isCompleted && (
                    <Button size="sm" onClick={() => claimReward(challenge.id)}>
                      Claim Reward
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {completedChallenges.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Recently Completed</h4>
            <div className="space-y-2">
              {completedChallenges.slice(0, 3).map((challenge) => (
                <div
                  key={challenge.id}
                  className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div>
                    <h5 className="font-medium text-sm">{challenge.title}</h5>
                    <p className="text-xs text-muted-foreground">{challenge.reward}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
