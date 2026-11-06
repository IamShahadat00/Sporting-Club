import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role-guard";
import { playerSchema } from "@/lib/validations/player";

export async function GET() {
  try {
    const players = await prisma.player.findMany({
      include: { team: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(players);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch players" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = playerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const cleanedData: any = {
      name: parsed.data.name,
      position: parsed.data.position || null,
      jerseyNumber: parsed.data.jerseyNumber || null,
      strongFoot: parsed.data.strongFoot || null,
      bio: parsed.data.bio || null,
      teamId:
        parsed.data.teamId === "none" || !parsed.data.teamId
          ? null
          : parsed.data.teamId,
      photoUrl:
        parsed.data.photoUrl && parsed.data.photoUrl.trim() !== ""
          ? parsed.data.photoUrl
          : null,
    };

    const player = await prisma.player.create({
      data: cleanedData,
      include: { team: true },
    });

    return NextResponse.json(player, { status: 201 });
  } catch (error) {
    console.error("POST Player Error:", error);
    return NextResponse.json(
      { error: "Failed to create player" },
      { status: 500 },
    );
  }
}


