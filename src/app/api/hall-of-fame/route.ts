import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role-guard";

export async function GET() {
  try {
    const legends = await prisma.hallOfFame.findMany({ 
      orderBy: { createdAt: 'desc' },
      include: { player: true } 
    });
    return NextResponse.json(legends);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const legend = await prisma.hallOfFame.create({ 
      data: {
        ...body,
        playerId: body.playerId || null // Handle optional relation
      } 
    });
    return NextResponse.json(legend, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}