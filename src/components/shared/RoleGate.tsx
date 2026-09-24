"use client"

import { useRole } from "@/hooks/useRole"

export function RoleGate({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const { isAdmin, isLoading } = useRole()
  if (isLoading) return null
  return isAdmin ? <>{children}</> : <>{fallback}</>
}