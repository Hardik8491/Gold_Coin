"use client"

import { Trophy, Star, Target, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function GamificationHeader() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-600" />
            Gamification
          </h1>
          <p className="text-muted-foreground">Track your progress, earn badges, and compete with others</p>
        </div>
        <div className="flex items-center gap-2">
          <Star className="h-8 w-8 text-yellow-500" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-2 p-4">
            <Trophy className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Level</p>
              <p className="text-2xl font-bold">Gold</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-2 p-4">
            <Star className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Points</p>
              <p className="text-2xl font-bold">2,450</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-2 p-4">
            <Target className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Badges Earned</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-2 p-4">
            <Users className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rank</p>
              <p className="text-2xl font-bold">#23</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
