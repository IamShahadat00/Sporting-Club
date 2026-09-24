"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"

export function MatchTimer({ actualStart, status }: { actualStart: string | Date | null; status: string }) {
  const [elapsed, setElapsed] = useState("00:00")

  useEffect(() => {
    if (status !== "LIVE" || !actualStart) return

    const tick = () => {
      const diffMs = Date.now() - new Date(actualStart).getTime()
      const totalMinutes = Math.max(0, Math.floor(diffMs / 60000))
      const seconds = Math.max(0, Math.floor((diffMs % 60000) / 1000))
      setElapsed(`${String(totalMinutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`)
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [actualStart, status])

  if (status !== "LIVE") return null

  return (
    <div className="flex items-center gap-1.5 text-sm font-mono text-danger">
      <Clock className="h-3.5 w-3.5" />
      {elapsed}'
    </div>
  )
}