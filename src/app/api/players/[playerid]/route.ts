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

    const cleanedData: any = {
      ...parsed.data,
      teamId:
        parsed.data.teamId === "none" || !parsed.data.teamId
          ? null
          : parsed.data.teamId,
      photoUrl:
        parsed.data.photoUrl && parsed.data.photoUrl.trim() !== ""
          ? parsed.data.photoUrl
          : null,
    };

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
