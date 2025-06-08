"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, Crown } from "lucide-react"

interface LeaderboardEntry {
  id: string
  name: string
  avatar?: string
  points: number
  level: string
  rank: number
  isCurrentUser: boolean
  badges: number
  streak: number
}

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch("/api/gamification/leaderboard")
        if (response.ok) {
          const data = await response.json()
          setLeaderboard(data.leaderboard)
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
        // Fallback data
        setLeaderboard([
          {
            id: "1",
            name: "Sarah Johnson",
            avatar: "/placeholder.svg",
            points: 4250,
            level: "Platinum Saver",
            rank: 1,
            isCurrentUser: false,
            badges: 18,
            streak: 45,
          },
          {
            id: "2",
            name: "Mike Chen",
            avatar: "/placeholder.svg",
            points: 3890,
            level: "Gold Investor",
            rank: 2,
            isCurrentUser: false,
            badges: 15,
            streak: 32,
          },
          {
            id: "3",
            name: "You",
            avatar: "/placeholder.svg",
            points: 2450,
            level: "Gold Saver",
            rank: 23,
            isCurrentUser: true,
            badges: 12,
            streak: 18,
          },
          {
            id: "4",
            name: "Emma Wilson",
            avatar: "/placeholder.svg",
            points: 2100,
            level: "Silver Tracker",
            rank: 4,
            isCurrentUser: false,
            badges: 10,
            streak: 25,
          },
          {
            id: "5",
            name: "David Brown",
            avatar: "/placeholder.svg",
            points: 1950,
            level: "Silver Saver",
            rank: 5,
            isCurrentUser: false,
            badges: 9,
            streak: 15,
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />
      default:
        return <Award className="h-5 w-5 text-gray-400" />
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-100 text-yellow-800"
      case 2:
        return "bg-gray-100 text-gray-800"
      case 3:
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>See how you rank against other users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 animate-pulse bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentUser = leaderboard.find((entry) => entry.isCurrentUser)
  const topUsers = leaderboard.filter((entry) => !entry.isCurrentUser).slice(0, 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          Leaderboard
        </CardTitle>
        <CardDescription>See how you rank against other users</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentUser && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold mb-2">Your Ranking</h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {getRankIcon(currentUser.rank)}
                  <span className="font-bold">#{currentUser.rank}</span>
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                  <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h5 className="font-semibold">{currentUser.name}</h5>
                  <p className="text-sm text-muted-foreground">{currentUser.level}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">{currentUser.points.toLocaleString()} pts</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{currentUser.badges} badges</span>
                  <span>•</span>
                  <span>{currentUser.streak} day streak</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="font-semibold">Top Performers</h4>
          {topUsers.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge className={getRankColor(entry.rank)}>#{entry.rank}</Badge>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={entry.avatar || "/placeholder.svg"} alt={entry.name} />
                  <AvatarFallback>{entry.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h5 className="font-semibold">{entry.name}</h5>
                  <p className="text-sm text-muted-foreground">{entry.level}</p>
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold">{entry.points.toLocaleString()} pts</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{entry.badges} badges</span>
                  <span>•</span>
                  <span>{entry.streak} day streak</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
