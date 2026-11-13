// src/app/api/ratings/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const matchId = url.searchParams.get("matchId");

    if (!matchId) {
      return NextResponse.json(
        { error: "matchId is required" },
        { status: 400 },
      );
    }

    const ratings = await prisma.playerRating.findMany({
      where: { matchId },
      select: { playerId: true, rating: true, userIp: true },
    });

    // Group ratings by playerId
    const playerStats: Record<
      string,
      { total: number; count: number; average: number }
    > = {};
    ratings.forEach((r) => {
      if (!playerStats[r.playerId]) {
        playerStats[r.playerId] = { total: 0, count: 0, average: 0 };
      }
      playerStats[r.playerId].total += r.rating;
      playerStats[r.playerId].count += 1;
    });

    Object.keys(playerStats).forEach((pid) => {
      const stats = playerStats[pid];
      stats.average = Number((stats.total / stats.count).toFixed(1));
    });

    return NextResponse.json(playerStats);
  } catch (error) {
    console.error("GET Ratings Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ratings" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    const { matchId, playerId, rating } = body;

    if (!matchId || !playerId || rating === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const numRating = Math.min(10, Math.max(1, Number(rating)));

    // Derive identifier: session user ID or client IP / header fingerprint
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      (session?.user as any)?.id ||
      "anonymous-fan";

    const savedRating = await prisma.playerRating.upsert({
      where: {
        matchId_playerId_userIp: {
          matchId,
          playerId,
          userIp: clientIp,
        },
      },
      create: {
        matchId,
        playerId,
        rating: numRating,
        userIp: clientIp,
        userId: (session?.user as any)?.id || null,
      },
      update: {
        rating: numRating,
      },
    });

    return NextResponse.json(savedRating, { status: 201 });
  } catch (error) {
    console.error("POST Rating Error:", error);
    return NextResponse.json(
      { error: "Failed to record rating" },
      { status: 500 },
    );
  }
}
