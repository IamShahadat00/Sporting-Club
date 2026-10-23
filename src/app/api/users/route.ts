import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role-guard";
import { userSchema } from "@/lib/validations/user";
import bcrypt from "bcryptjs";

export async function GET() {
  await requireAdmin();
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isApproved: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = userSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    if (!parsed.data.password) {
      return NextResponse.json(
        { error: "Password is required for new users" },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: parsed.data.name.trim(),
        email,
        role: parsed.data.role as any,
        hashedPassword,
        isApproved: true, // Admin-created users are approved by default
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isApproved: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("User creation error:", error);
    return NextResponse.json(
      { error: "Failed to create user. Verify your Prisma schema and database." },
      { status: 500 },
    );
  }
}