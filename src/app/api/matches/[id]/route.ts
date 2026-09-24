import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role-guard";
import { matchReportSchema } from "@/lib/validations/match";
import { recalculateStanding } from "@/lib/standing";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    // 1. LIVE SCORE UPDATE
    if (body.action === "score") {
      return NextResponse.json(
        await prisma.match.update({
          where: { id },
          data: {
            homeScore: Number(body.homeScore),
            awayScore: Number(body.awayScore),
            events: body.events || [],
            isPenalty: body.isPenalty ?? false,
            homePens: Number(body.homePens || 0),
            awayPens: Number(body.awayPens || 0),
            broadcastUrl: body.broadcastUrl || null,
          },
        }),
      );
    }

    // 2. FINALIZE MATCH & MVP AWARD
    if (body.action === "finalize") {
      const parsed = matchReportSchema.safeParse(body);
      if (!parsed.success)
        return NextResponse.json(
          { error: parsed.error.flatten() },
          { status: 400 },
        );

      const match = await prisma.match.update({
        where: { id },
        data: {
          status: "FINISHED",
          report: body.report,
          homeScore: Number(body.homeScore),
          awayScore: Number(body.awayScore),
          events: body.events || [],
          broadcastUrl: body.broadcastUrl || null,
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
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
