import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/role-guard"
import { tournamentSchema } from "@/lib/validations/tournament"

export async function GET() {
  const seasons = await prisma.season.findMany({
    include: { _count: { select: { matches: true, registrations: true } } },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(seasons)
}

export async function POST(req: Request) {
  await requireAdmin()
  const body = await req.json()
  const parsed = tournamentSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  // Only one season can be ACTIVE at a time — auto-demote the current one
  if (parsed.data.status === "ACTIVE") {
    await prisma.season.updateMany({ where: { status: "ACTIVE" }, data: { status: "COMPLETED" } })
  }

  const season = await prisma.season.create({
    data: {
      ...parsed.data,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined,
    },
  })
  return NextResponse.json(season, { status: 201 })
}