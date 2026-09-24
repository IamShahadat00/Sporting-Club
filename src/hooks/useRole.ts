"use client"

import { useSession } from "next-auth/react"

export function useRole() {
  const { data: session, status } = useSession()
  const role = (session?.user as any)?.role as "ADMIN" | "EDITOR" | "VIEWER" | undefined

  return {
    role,
    isAdmin: role === "ADMIN",
    isLoading: status === "loading",
  }
}