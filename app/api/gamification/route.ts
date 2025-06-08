import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db, gamification } from "@/lib/db";
import { eq } from "drizzle-orm";
import { redis, CACHE_TTL } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    const { userId } =  await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try cache first
    const cacheKey = `gamification_${userId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return NextResponse.json(cached);
    }

    // Get or create gamification data
    let [userGamification] = await db
      .select()
      .from(gamification)
      .where(eq(gamification.userId, userId));

    if (!userGamification) {
      // Create initial gamification data
      [userGamification] = await db
        .insert(gamification)
        .values({
          userId,
          level: 1,
          experience: 0,
          coins: 100, // Starting bonus
          badges: [],
          streaks: {
            current: 0,
            longest: 0,
            type: "daily",
            lastActivity: new Date().toISOString(),
          },
          challenges: [
            {
              id: "first_transaction",
              title: "First Transaction",
              description: "Add your first transaction",
              type: "spending",
              target: 1,
              progress: 0,
              reward: { coins: 50, experience: 100 },
              startDate: new Date().toISOString(),
              endDate: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              ).toISOString(),
              status: "active",
            },
            {
              id: "budget_creator",
              title: "Budget Creator",
              description: "Create your first budget",
              type: "budget",
              target: 1,
              progress: 0,
              reward: { coins: 100, experience: 200 },
              startDate: new Date().toISOString(),
              endDate: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              ).toISOString(),
              status: "active",
            },
          ],
        })
        .returning();
    }

    const response = {
      ...userGamification,
      nextLevelXP: userGamification.level * 1000,
      progressToNextLevel: (userGamification.experience % 1000) / 10,
    };

    // Cache the result
    await redis.setex(cacheKey, CACHE_TTL.GAMIFICATION || 300, response);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching gamification data:", error);
    return NextResponse.json(
      { error: "Failed to fetch gamification data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, data } = await request.json();

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }

    // Get current gamification data
    const [currentGamification] = await db
      .select()
      .from(gamification)
      .where(eq(gamification.userId, userId));

    if (!currentGamification) {
      return NextResponse.json(
        { error: "Gamification data not found" },
        { status: 404 }
      );
    }

    const updates: any = {};
    const rewards = { coins: 0, experience: 0, badges: [] as any[] };

    switch (action) {
      case "add_transaction":
        rewards.coins = 10;
        rewards.experience = 25;
        break;
      case "create_budget":
        rewards.coins = 50;
        rewards.experience = 100;
        break;
      case "reach_goal":
        rewards.coins = 200;
        rewards.experience = 500;
        rewards.badges.push({
          id: "goal_achiever",
          name: "Goal Achiever",
          description: "Reached a financial goal",
          icon: "🎯",
          rarity: "rare",
          earnedAt: new Date().toISOString(),
        });
        break;
      case "streak_milestone":
        const streakDays = data?.days || 0;
        rewards.coins = streakDays * 5;
        rewards.experience = streakDays * 10;
        if (streakDays >= 7) {
          rewards.badges.push({
            id: "week_warrior",
            name: "Week Warrior",
            description: "7-day activity streak",
            icon: "🔥",
            rarity: "common",
            earnedAt: new Date().toISOString(),
          });
        }
        break;
    }

    // Calculate new totals
    const newCoins = currentGamification.coins + rewards.coins;
    const newExperience = currentGamification.experience + rewards.experience;
    const newLevel = Math.floor(newExperience / 1000) + 1;
    const newBadges = [...currentGamification.badges, ...rewards.badges];

    // Update gamification data
    const [updatedGamification] = await db
      .update(gamification)
      .set({
        coins: newCoins,
        experience: newExperience,
        level: newLevel,
        badges: newBadges,
        updatedAt: new Date(),
      })
      .where(eq(gamification.userId, userId))
      .returning();

    // Invalidate cache
    await redis.del(`gamification_${userId}`);

    return NextResponse.json({
      ...updatedGamification,
      rewards,
      levelUp: newLevel > currentGamification.level,
    });
  } catch (error) {
    console.error("Error updating gamification:", error);
    return NextResponse.json(
      { error: "Failed to update gamification" },
      { status: 500 }
    );
  }
}
