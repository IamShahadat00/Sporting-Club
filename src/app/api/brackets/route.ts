import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role-guard";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const seasonId = url.searchParams.get("seasonId");
    if (!seasonId) return NextResponse.json({ error: "Missing seasonId" }, { status: 400 });

    const bracket = await prisma.bracket.findUnique({
      where: { seasonId },
      include: {
        rounds: {
          include: { match: { include: { homeTeam: true, awayTeam: true } } },
          orderBy: [{ round: "asc" }, { slotIndex: "asc" }],
        },
      },
    });

    // Return the nodes array directly so 'data.flat()' isn't needed
    return NextResponse.json(bracket?.rounds || []);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load bracket" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { seasonId } = await req.json();

    const existing = await prisma.bracket.findUnique({ where: { seasonId } });
    if (existing) {
      await prisma.bracketMatch.deleteMany({ where: { bracketId: existing.id } });
      await prisma.bracket.delete({ where: { id: existing.id } });
    }

    const bracket = await prisma.bracket.create({ data: { seasonId } });

    // Specialized IPL/BPL Style Playoff Slots
    const slots = [
      { round: 1, slotIndex: 0, label: "Qualifier 1 (1st v 2nd)" },
      { round: 1, slotIndex: 1, label: "Eliminator (3rd v 4th)" },
      { round: 2, slotIndex: 0, label: "Qualifier 2 (Loser Q1 v Winner Elim)" },
      { round: 3, slotIndex: 0, label: "Grand Final (Winner Q1 v Winner Q2)" },
    ];

    for (const slot of slots) {
      await prisma.bracketMatch.create({
        data: { bracketId: bracket.id, ...slot }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    const { nodeId, matchId } = await req.json();
    const updated = await prisma.bracketMatch.update({
      where: { id: nodeId },
      data: { matchId: matchId === "none" ? null : matchId }
    });
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}