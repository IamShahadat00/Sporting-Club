// src/app/api/admin/ratings/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role-guard";

export async function GET() {
  try {
    await requireAdmin();

    const [players, matches, allRatings, allMvps] = await Promise.all([
      prisma.player.findMany({
        include: {
          team: true,
          mvpAwards: true,
          ratings: true,
        },
        orderBy: { name: "asc" },
      }),
      prisma.match.findMany({
        select: { id: true, events: true },
      }),
      prisma.playerRating.findMany(),
      prisma.mvpAward.findMany(),
    ]);

    // 1. Calculate goals per player from logged match events
    const goalsCountMap: Record<string, number> = {};
    matches.forEach((m) => {
      const evts = (m.events as any[]) || [];
      evts.forEach((e) => {
        if (e?.type === "GOAL" && e?.player) {
          const key = String(e.player).trim().toLowerCase();
          goalsCountMap[key] = (goalsCountMap[key] || 0) + 1;
        }
      });
    });

    // 2. Count MVP awards per player from MvpAward table
    const mvpCountMap: Record<string, number> = {};
    allMvps.forEach((m) => {
      if (m.playerId) {
        mvpCountMap[m.playerId] = (mvpCountMap[m.playerId] || 0) + 1;
      }
    });

    // 3. Aggregate Player Ratings & Votes
    const ratingsMap: Record<string, { total: number; count: number }> = {};
    allRatings.forEach((r) => {
      if (!ratingsMap[r.playerId]) {
        ratingsMap[r.playerId] = { total: 0, count: 0 };
      }
      ratingsMap[r.playerId].total += r.rating;
      ratingsMap[r.playerId].count += 1;
    });

    // 4. Combine into final dataset
    const playerStats = players.map((p) => {
      const eventGoals = goalsCountMap[p.name.trim().toLowerCase()] || 0;
      const totalGoals = Math.max(p.goals || 0, eventGoals);

      const rData = ratingsMap[p.id];
      const votesCount = rData ? rData.count : 0;
      const totalPoints = rData ? Number(rData.total.toFixed(1)) : 0;
      const avgRating =
        votesCount > 0 ? Number((totalPoints / votesCount).toFixed(1)) : 0;

      const mvpsWon = mvpCountMap[p.id] || p.mvpAwards?.length || 0;

      return {
        id: p.id,
        name: p.name,
        jerseyNumber: p.jerseyNumber,
        position: p.position,
        photoUrl: p.photoUrl,
        strongFoot: p.strongFoot,
        isInjured: p.isInjured,
        teamId: p.teamId,
        team: p.team,
        goals: totalGoals,
        mvpCount: mvpsWon,
        votesCount,
        totalPoints,
        avgRating,
      };
    });

    // Sort by MVP desc, then Rating desc, then Goals desc
    playerStats.sort(
      (a, b) =>
        b.mvpCount - a.mvpCount ||
        b.avgRating - a.avgRating ||
        b.goals - a.goals,
    );

    return NextResponse.json(playerStats);
  } catch (error) {
    console.error("Admin ratings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch player stats" },
      { status: 500 },
    );
  }
}
