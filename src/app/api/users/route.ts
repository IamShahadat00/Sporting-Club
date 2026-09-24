import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/role-guard"
import { userSchema } from "@/lib/validations/user"
import bcrypt from "bcryptjs"

export async function GET() {
  await requireAdmin()
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true }, // never return hashedPassword
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(users)
}

export async function POST(req: Request) {
  await requireAdmin()
  const body = await req.json()
  const parsed = userSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  if (!parsed.data.password) {
    return NextResponse.json({ error: "Password is required for new users" }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 })

  const hashedPassword = await bcrypt.hash(parsed.data.password, 10)
  const user = await prisma.user.create({
    data: { name: parsed.data.name, email: parsed.data.email, role: parsed.data.role, hashedPassword },
    select: { id: true, name: true, email: true, role: true },
  })
  return NextResponse.json(user, { status: 201 })
}