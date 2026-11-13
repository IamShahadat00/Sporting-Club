// src/app/api/players/[playerid]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role-guard";
import { playerSchema } from "@/lib/validations/player";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ playerid: string }> },
) {
  try {
    await requireAdmin();
    const { playerid } = await params;
    const body = await req.json();

    const parsed = playerSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // CRITICAL FIX: Only update fields that were explicitly provided in the request.
    // Do NOT overwrite teamId or photoUrl if they were not sent in this update!
    const cleanedData: any = {};
    if (parsed.data.name !== undefined) cleanedData.name = parsed.data.name;
    if (parsed.data.position !== undefined)
      cleanedData.position = parsed.data.position || null;
    if (parsed.data.jerseyNumber !== undefined)
      cleanedData.jerseyNumber = parsed.data.jerseyNumber || null;
    if (parsed.data.strongFoot !== undefined)
      cleanedData.strongFoot = parsed.data.strongFoot || null;
    if (parsed.data.bio !== undefined)
      cleanedData.bio = parsed.data.bio || null;

    if (body.teamId !== undefined) {
      cleanedData.teamId =
        body.teamId === "none" || !body.teamId ? null : body.teamId;
    }

    if (body.photoUrl !== undefined) {
      cleanedData.photoUrl =
        body.photoUrl && body.photoUrl.trim() !== "" ? body.photoUrl : null;
    }

    const player = await prisma.player.update({
      where: { id: playerid },
      data: cleanedData,
      include: { team: true },
    });

    return NextResponse.json(player);
  } catch (error) {
    console.error("PATCH Player Error:", error);
    return NextResponse.json(
      { error: "Failed to update player" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ playerid: string }> },
) {
  try {
    await requireAdmin();
    const { playerid } = await params;

    await prisma.registration.deleteMany({ where: { playerId: playerid } });
    await prisma.mvpAward.deleteMany({ where: { playerId: playerid } });
    await prisma.hallOfFame.updateMany({
      where: { playerId: playerid },
      data: { playerId: null },
    });

    await prisma.player.delete({ where: { id: playerid } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete player" },
      { status: 500 },
    );
  }
}
