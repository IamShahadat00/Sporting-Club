import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const seasonId = url.searchParams.get("seasonId");

    if (!seasonId) {
      return NextResponse.json({ error: "seasonId is required" }, { status: 400 });
    }

    // 1. Fetch standings from DB
    const standings = await prisma.standing.findMany({
      where: { seasonId: seasonId },
      include: { team: true },
      orderBy: [
        { points: "desc" },
        { goalDiff: "desc" },
        { goalsFor: "desc" }
      ]
    });

    // 2. Calculate Form (Last 5 matches) for each team
    const standingsWithForm = await Promise.all(
      standings.map(async (s) => {
        const lastMatches = await prisma.match.findMany({
          where: {
            seasonId,
            status: "FINISHED",
            OR: [{ homeTeamId: s.teamId }, { awayTeamId: s.teamId }]
          },
          orderBy: { scheduledStart: 'desc' },
          take: 5
        });

        // Map results to W, D, L
        const form = lastMatches.map(m => {
          const isHome = m.homeTeamId === s.teamId;
          const teamScore = isHome ? m.homeScore : m.awayScore;
          const oppScore = isHome ? m.awayScore : m.homeScore;

          if (teamScore > oppScore) return 'W';
          if (teamScore < oppScore) return 'L';
          return 'D';
        }).reverse(); // Reverse so latest is on the right

        return { ...s, form };
      })
    );

    return NextResponse.json(standingsWithForm);
  } catch (error) {
    console.error("Standings API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}