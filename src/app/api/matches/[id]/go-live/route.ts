import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/role-guard"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  await requireAdmin()
  const body = await req.json().catch(() => ({}))

  const match = await prisma.match.update({
    where: { id: params.id },
    data: {
      status: "LIVE",
      actualStart: body.customStart ? new Date(body.customStart) : new Date(),
    },
  })

  return NextResponse.json(match)
}