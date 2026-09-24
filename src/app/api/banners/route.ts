import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/role-guard"
import { bannerSchema } from "@/lib/validations/banner"

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(banners)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin()
    const body = await req.json()
    const parsed = bannerSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const banner = await prisma.banner.create({
      data: {
        ...parsed.data,
        startAt: new Date(parsed.data.startAt),
        endAt: new Date(parsed.data.endAt),
      }
    })
    
    return NextResponse.json(banner)
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized or Database error" }, { status: 500 })
  }
}
