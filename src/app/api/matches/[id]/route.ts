import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role-guard";
import { matchReportSchema } from "@/lib/validations/match";
import { recalculateStanding } from "@/lib/standing";

export function parseMatchIdentifier(rawParam: string) {
  const decoded = decodeURIComponent(rawParam).trim();
  const matchNumRegex = /^(?:match[-#_]?)?0*(\d+)$/i;
  const match = decoded.match(matchNumRegex);

  if (match) {
    return { matchNumber: parseInt(match[1], 10), raw: decoded };
  }

  return { id: decoded, raw: decoded };
}

// 1. GET SINGLE MATCH
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const identifier = parseMatchIdentifier(id);

    const match = await prisma.match.findFirst({
      where: {
        OR: [
          { id: identifier.raw },
          ...(identifier.matchNumber !== undefined
            ? [{ matchNumber: identifier.matchNumber }]
            : []),
        ],
      },
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

// 2. PATCH: UPDATE MATCH (Score, Finalize, or General Reschedule/Edit)
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
      where: {
        OR: [
          { id: identifier.raw },
          ...(identifier.matchNumber !== undefined
            ? [{ matchNumber: identifier.matchNumber }]
            : []),
        ],
      },
      select: { id: true, seasonId: true, homeTeamId: true, awayTeamId: true },
    });

    if (!targetMatch) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // A. LIVE SCORE & EVENTS UPDATE
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

    // B. FINALIZE MATCH & MVP
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
          highlightsUrl: body.highlightsUrl || null,
          highlightsTitle: body.highlightsTitle || null,
          isPenalty: body.isPenalty ?? false,
          homePens: Number(body.homePens || 0),
          awayPens: Number(body.awayPens || 0),
          mvpAward: body.mvpPlayerId
            ? {
                upsert: {
                  create: {
                    playerId: body.mvpPlayerId,
                    citation:
                      body.mvpCitation || "Exceptional match performance.",
                    photoUrl: body.mvpPhotoUrl,
                  },
                  update: {
                    playerId: body.mvpPlayerId,
                    citation:
                      body.mvpCitation || "Exceptional match performance.",
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

    // C. GENERAL MATCH DETAILS EDIT (Reschedule, Teams, Venue, Broadcast, Status)
    const updateData: any = {};
    if (body.matchNumber !== undefined)
      updateData.matchNumber = Number(body.matchNumber);
    if (body.seasonId) updateData.seasonId = body.seasonId;
    if (body.homeTeamId) updateData.homeTeamId = body.homeTeamId;
    if (body.awayTeamId) updateData.awayTeamId = body.awayTeamId;
    if (body.scheduledStart)
      updateData.scheduledStart = new Date(body.scheduledStart);
    if (body.venue !== undefined) updateData.venue = body.venue || null;
    if (body.broadcastUrl !== undefined)
      updateData.broadcastUrl = body.broadcastUrl || null;
    if (body.status) updateData.status = body.status;
    if (body.homeScore !== undefined && !body.action)
      updateData.homeScore = Number(body.homeScore);
    if (body.awayScore !== undefined && !body.action)
      updateData.awayScore = Number(body.awayScore);

    const updated = await prisma.match.update({
      where: { id: targetMatch.id },
      data: updateData,
    });

    if (body.status === "FINISHED") {
      await recalculateStanding(updated.seasonId, updated.homeTeamId);
      await recalculateStanding(updated.seasonId, updated.awayTeamId);
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Match PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update match" },
      { status: 500 },
    );
  }
}

// 3. DELETE MATCH
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const identifier = parseMatchIdentifier(id);

    const target = await prisma.match.findFirst({
      where: {
        OR: [
          { id: identifier.raw },
          ...(identifier.matchNumber !== undefined
            ? [{ matchNumber: identifier.matchNumber }]
            : []),
        ],
      },
    });

    if (!target) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // Unlink any bracket slots
    await prisma.bracketMatch.updateMany({
      where: { matchId: target.id },
      data: { matchId: null },
    });

    // Remove MVP award
    await prisma.mvpAward.deleteMany({
      where: { matchId: target.id },
    });

    // Delete match
    await prisma.match.delete({
      where: { id: target.id },
    });

    // Recalculate standings
    await recalculateStanding(target.seasonId, target.homeTeamId);
    await recalculateStanding(target.seasonId, target.awayTeamId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Match DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete match" },
      { status: 500 },
    );
  }
}
