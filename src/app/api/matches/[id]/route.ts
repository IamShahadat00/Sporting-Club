// src/app/api/matches/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role-guard";
import { matchReportSchema } from "@/lib/validations/match";
import { recalculateStanding } from "@/lib/standing";

export function parseMatchIdentifier(rawParam: string) {
  const decoded = decodeURIComponent(rawParam).trim();

  // Matches "match-02", "match#02", "match-2", or pure number "2"
  const matchNumRegex = /^(?:match[-#_]?)?0*(\d+)$/i;
  const match = decoded.match(matchNumRegex);

  if (match) {
    return { matchNumber: parseInt(match[1], 10) };
  }

  // Fallback to CUID / Database ID
  return { id: decoded };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const identifier = parseMatchIdentifier(id);

    const match = await prisma.match.findFirst({
      where:
        identifier.matchNumber !== undefined
          ? { matchNumber: identifier.matchNumber }
          : { id: identifier.id },
      include: {
        homeTeam: { include: { players: { orderBy: { name: "asc" } } } },
        awayTeam: { include: { players: { orderBy: { name: "asc" } } } },
        season: true,
        mvpAward: { include: { player: true } },
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    return NextResponse.json(match);
  } catch (error) {
    console.error("GET Match Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch match details" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const identifier = parseMatchIdentifier(id);

    const targetMatch = await prisma.match.findFirst({
      where:
        identifier.matchNumber !== undefined
          ? { matchNumber: identifier.matchNumber }
          : { id: identifier.id },
      select: { id: true, seasonId: true, homeTeamId: true, awayTeamId: true },
    });

    if (!targetMatch) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // 1. LIVE SCORE UPDATE
    if (body.action === "score") {
      const updated = await prisma.match.update({
        where: { id: targetMatch.id },
        data: {
          homeScore: Number(body.homeScore),
          awayScore: Number(body.awayScore),
          events: body.events || [],
          isPenalty: body.isPenalty ?? false,
          homePens: Number(body.homePens || 0),
          awayPens: Number(body.awayPens || 0),
          broadcastUrl: body.broadcastUrl || null,
        },
      });
      return NextResponse.json(updated);
    }

    // 2. FINALIZE MATCH & MVP AWARD
    if (body.action === "finalize") {
      const parsed = matchReportSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.flatten() },
          { status: 400 },
        );
      }

      const match = await prisma.match.update({
        where: { id: targetMatch.id },
        data: {
          status: "FINISHED",
          report: body.report,
          homeScore: Number(body.homeScore),
          awayScore: Number(body.awayScore),
          events: body.events || [],
          broadcastUrl: body.broadcastUrl || null,
          isPenalty: body.isPenalty ?? false,
          homePens: Number(body.homePens || 0),
          awayPens: Number(body.awayPens || 0),
          mvpAward: body.mvpPlayerId
            ? {
                upsert: {
                  create: {
                    playerId: body.mvpPlayerId,
                    citation:
                      body.mvpCitation ||
                      "Exceptional contribution to the team's victory.",
                    photoUrl: body.mvpPhotoUrl,
                  },
                  update: {
                    playerId: body.mvpPlayerId,
                    citation:
                      body.mvpCitation ||
                      "Exceptional contribution to the team's victory.",
                    photoUrl: body.mvpPhotoUrl,
                  },
                },
              }
            : undefined,
        },
      });

      await recalculateStanding(match.seasonId, match.homeTeamId);
      await recalculateStanding(match.seasonId, match.awayTeamId);
      return NextResponse.json(match);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Match patch error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
