"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Check, X } from "lucide-react"
import { toast } from "sonner"

export default function RegistrationsAdminPage() {
  const [registrations, setRegistrations] = useState<any[]>([])
  const [filter, setFilter] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING")

  const load = () => fetch(`/api/registrations?status=${filter}`).then((r) => r.json()).then(setRegistrations)
  useEffect(() => { load() }, [filter])

  const decide = async (id: string, status: "APPROVED" | "REJECTED") => {
    await fetch("/api/registrations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })
    toast.success(status === "APPROVED" ? "Player approved for the season" : "Registration rejected")
    setRegistrations((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Player Registrations</h2>
        <div className="flex gap-2">
          {(["PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
            <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)}>
              {s}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {registrations.map((reg) => (
          <Card key={reg.id}>
            <CardContent className="p-4 flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={reg.player.photoUrl} />
                <AvatarFallback>{reg.player.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{reg.player.name}</p>
                <p className="text-xs text-muted-foreground">{reg.player.position} · #{reg.player.jerseyNumber} · {reg.player.district}</p>
                <Badge variant="outline" className="mt-1 text-xs">{reg.season.name}</Badge>
              </div>
              {filter === "PENDING" && (
                <div className="flex flex-col gap-1">
                  <Button size="icon" className="h-8 w-8 bg-pitch hover:bg-pitch-dark" onClick={() => decide(reg.id, "APPROVED")}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => decide(reg.id, "REJECTED")}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {registrations.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full py-8 text-center">No {filter.toLowerCase()} registrations.</p>
        )}
      </div>
    </div>
  )
}