import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const seasonId = url.searchParams.get("seasonId");

    if (!seasonId) {
      return NextResponse.json({ error: "seasonId is required" }, { status: 400 });
    }

    // 1. Fetch all registered teams in the league
    const allTeams = await prisma.team.findMany({
      orderBy: { name: "asc" },
    });

    if (allTeams.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Fetch existing standings for this season
    const existingStandings = await prisma.standing.findMany({
      where: { seasonId },
      include: { team: true },
    });

    const existingMap = new Map(existingStandings.map((s) => [s.teamId, s]));

    // 3. Ensure every registered team has an entry in this season's standings
    const completeStandings = await Promise.all(
      allTeams.map(async (team) => {
        const existing = existingMap.get(team.id);
        if (existing) return existing;

        // Auto-create initial 0-stats standing for any team not yet recorded
        return await prisma.standing.upsert({
          where: { seasonId_teamId: { seasonId, teamId: team.id } },
          create: {
            seasonId,
            teamId: team.id,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            points: 0,
            goalDiff: 0,
            goalsFor: 0,
            goalsAgainst: 0,
          },
          update: {},
          include: { team: true },
        });
      })
    );

    // 4. Calculate Form (Last 5 finished matches) for each team
    const standingsWithForm = await Promise.all(
      completeStandings.map(async (s) => {
        const lastMatches = await prisma.match.findMany({
          where: {
            seasonId,
            status: "FINISHED",
            OR: [{ homeTeamId: s.teamId }, { awayTeamId: s.teamId }],
          },
          orderBy: { scheduledStart: "desc" },
          take: 5,
        });

        const form = lastMatches
          .map((m) => {
            const isHome = m.homeTeamId === s.teamId;
            const teamScore = isHome ? m.homeScore : m.awayScore;
            const oppScore = isHome ? m.awayScore : m.homeScore;

            if (teamScore > oppScore) return "W";
            if (teamScore < oppScore) return "L";
            return "D";
          })
          .reverse();

        return { ...s, form };
      })
    );

    // 5. Official Football Ranking Sort: Points -> Goal Difference -> Goals For -> Goals Conceded (lowest)
    standingsWithForm.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return a.goalsAgainst - b.goalsAgainst;
    });

    return NextResponse.json(standingsWithForm);
  } catch (error) {
    console.error("Standings API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}