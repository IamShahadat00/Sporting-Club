import { auth } from "@/lib/auth"

export async function requireAdmin() {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") {
    throw new Response("Forbidden", { status: 403 })
  }
  return session
}