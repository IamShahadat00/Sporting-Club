import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role-guard";

export async function GET() {
  const news = await prisma.announcement.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(news);
}

export async function POST(req: Request) {
  await requireAdmin();
  const body = await req.json();
  const item = await prisma.announcement.create({ data: body });
  return NextResponse.json(item, { status: 201 });
}