import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/role-guard"
import { sponsorSchema } from "@/lib/validations/sponsor"

export async function GET() {
  const sponsors = await prisma.sponsor.findMany({ orderBy: [{ tier: "asc" }, { order: "asc" }] })
  return NextResponse.json(sponsors)
}

export async function POST(req: Request) {
  await requireAdmin()
  const parsed = sponsorSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const sponsor = await prisma.sponsor.create({ data: parsed.data })
  return NextResponse.json(sponsor, { status: 201 })
}