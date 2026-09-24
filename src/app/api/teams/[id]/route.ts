import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role-guard";
import { teamSchema } from "@/lib/validations/team";

// GET: Fetch a single team with all its details and players
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        players: {
          orderBy: { name: "asc" },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json(team);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch team" },
      { status: 500 },
    );
  }
}

// PATCH: Update team details
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    const parsed = teamSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // Filter and clean data
    const cleanedData: any = {};
    const allowedFields = [
      "name",
      "logoUrl",
      "district",
      "founded",
      "ownerName",
      "ownerPhoto",
      "ownerBio",
      "mentorName",
      "mentorPhoto",
      "mentorBio",
      "description",
      "titlesWon",
      "sponsorName",
      "sponsorLogo",
      "captainId",
      "viceCaptainId",
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        cleanedData[field] = body[field] === "" ? null : body[field];
      }
    });

    const team = await prisma.team.update({
      where: { id },
      data: cleanedData,
    });

    return NextResponse.json(team);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// DELETE: Remove team
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const matchCount = await prisma.match.count({
      where: { OR: [{ homeTeamId: id }, { awayTeamId: id }] },
    });

    if (matchCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete team with matches" },
        { status: 409 },
      );
    }

    await prisma.team.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
