import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/role-guard"
import { tournamentSchema } from "@/lib/validations/tournament"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await req.json()
    
    // Use partial() to allow updating only some fields
    const parsed = tournamentSchema.partial().safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const data: any = { ...parsed.data }
    // Only convert if the date actually exists and isn't empty
    if (data.startDate) data.startDate = new Date(data.startDate)
    if (data.endDate) data.endDate = new Date(data.endDate)

    const season = await prisma.season.update({ where: { id }, data })
    return NextResponse.json(season)
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const matchCount = await prisma.match.count({ where: { seasonId: id } })
    if (matchCount > 0) return NextResponse.json({ error: "Cannot delete a season with existing matches." }, { status: 409 })
    await prisma.season.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}