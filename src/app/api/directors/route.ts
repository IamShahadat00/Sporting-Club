import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/role-guard"
import { z } from "zod"

const directorSchema = z.object({
  name: z.string().min(2),
  designation: z.string().min(2),
  bio: z.string().optional(),
  photoUrl: z.string().optional(),
  order: z.number().optional(),
})

export async function GET() {
  const directors = await prisma.director.findMany({ orderBy: { order: "asc" } })
  return NextResponse.json(directors)
}

export async function POST(req: Request) {
  await requireAdmin()
  const parsed = directorSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const director = await prisma.director.create({ data: parsed.data })
  return NextResponse.json(director, { status: 201 })
}