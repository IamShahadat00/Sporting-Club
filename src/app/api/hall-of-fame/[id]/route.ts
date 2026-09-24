import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role-guard";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    // 1. Destructure ONLY the fields we want to update.
    // This removes 'id', 'createdAt', 'updatedAt', and 'player' (the relation object)
    // which were causing the Prisma crash.
    const { name, title, year, description, imageUrl, playerId } = body;

    // 2. Perform the update with cleaned data
    const entry = await prisma.hallOfFame.update({
      where: { id },
      data: {
        name,
        title,
        year,
        description,
        imageUrl,
        // Ensure playerId is null if an empty string was passed
        playerId: playerId && playerId.trim() !== "" ? playerId : null,
      },
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Hall of Fame Update Error:", error);
    return NextResponse.json(
      {
        error:
          "Update failed. Make sure you ran 'npx prisma db push' after changing the schema.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.hallOfFame.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Hall of Fame Delete Error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
