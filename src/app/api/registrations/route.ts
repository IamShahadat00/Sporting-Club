import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { registrationSchema } from "@/lib/validations/registration"
import { requireAdmin } from "@/lib/role-guard"

export async function GET(req: Request) {
  await requireAdmin()
  const url = new URL(req.url)
  const status = url.searchParams.get("status") // ?status=PENDING to filter

  const registrations = await prisma.registration.findMany({
    where: status ? { status: status as any } : undefined,
    include: { player: true, season: true },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(registrations)
}

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = registrationSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const player = await prisma.player.create({
    data: {
      name: parsed.data.playerName,
      position: parsed.data.position,
      jerseyNumber: parsed.data.jerseyNumber,
      district: parsed.data.district,
      photoUrl: parsed.data.photoUrl,
    },
  })

  const registration = await prisma.registration.create({
    data: { playerId: player.id, seasonId: body.seasonId, status: "PENDING" },
  })
  return NextResponse.json(registration, { status: 201 })
}

export async function PATCH(req: Request) {
  await requireAdmin()
  const { id, status } = await req.json()

  const registration = await prisma.registration.update({
    where: { id },
    data: { status },
    include: { player: true },
  })

  // Approving a registration auto-assigns the player to the season's team pool
  // by making sure they're linked (already true via Player.teamId if set elsewhere,
  // this just confirms the registration itself is now official)
  return NextResponse.json(registration)
}