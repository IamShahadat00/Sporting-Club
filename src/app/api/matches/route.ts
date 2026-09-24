import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role-guard";
import { matchSchema } from "@/lib/validations/match";

export async function GET() {
  try {
    const matches = await prisma.match.findMany({
      include: {
        homeTeam: true,
        awayTeam: true,
        season: true,
        mvpAward: { include: { player: true } },
      },
      orderBy: { matchNumber: "desc" },
    });
    return NextResponse.json(matches);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    const body = await req.json();

    // 1. Validate basic fields
    const parsed = matchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // 2. Auto-Increment Match Number Logic
    let mNo = Number(body.matchNumber);
    if (!mNo || mNo === 0) {
      const lastMatch = await prisma.match.findFirst({
        orderBy: { matchNumber: "desc" },
      });
      mNo = (lastMatch?.matchNumber || 0) + 1;
    }

    // 3. Create Match
    const match = await prisma.match.create({
      data: {
        matchNumber: mNo,
        seasonId: body.seasonId,
        homeTeamId: body.homeTeamId,
        awayTeamId: body.awayTeamId,
        scheduledStart: new Date(body.scheduledStart),
        venue: body.venue || null,
        broadcastUrl: body.broadcastUrl || null,
        createdById: session!.user!.id as string,
        status: body.status || "SCHEDULED",
        homeScore: 0,
        awayScore: 0,
      },
    });

    return NextResponse.json(match, { status: 201 });
  } catch (error) {
    console.error("POST Match Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
