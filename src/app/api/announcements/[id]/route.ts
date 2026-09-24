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

    // Destructure to prevent trying to update 'id' or relation objects
    const { title, content, imageUrl, linkUrl, type, isActive } = body;

    const updated = await prisma.announcement.update({
      where: { id },
      data: {
        title,
        content,
        imageUrl: imageUrl || null,
        linkUrl: linkUrl || null,
        type,
        isActive: isActive === true || isActive === "true",
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Announcement Update Error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await prisma.announcement.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
