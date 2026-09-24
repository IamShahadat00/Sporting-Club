import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role-guard";
import { teamSchema } from "@/lib/validations/team";

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        _count: { select: { players: true } },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(teams);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = teamSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // Clean data: Convert empty strings to null for database integrity
    const data = { ...parsed.data };
    Object.keys(data).forEach((key) => {
      if ((data as any)[key] === "") {
        (data as any)[key] = null;
      }
    });

    const team = await prisma.team.create({
      data: data,
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    console.error("Teams POST Error:", error);
    return NextResponse.json(
      { error: "Unauthorized or Database error" },
      { status: 500 },
    );
  }
}
