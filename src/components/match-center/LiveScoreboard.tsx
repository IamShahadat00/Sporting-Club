"use client"

import { useLiveMatch } from "@/hooks/useLiveMatch"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"

export function LiveScoreboard({ matchId, initialData }: { matchId: string; initialData: any }) {
  const match = useLiveMatch(matchId, initialData)
  const isLive = match.status === "LIVE"

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        {isLive && (
          <Badge className="bg-danger text-white gap-1.5 animate-pulseLive">
            <span className="h-2 w-2 rounded-full bg-white" /> LIVE
          </Badge>
        )}
        {match.status === "FINISHED" && <Badge variant="secondary">Full time</Badge>}
        {match.status === "SCHEDULED" && (
          <Badge variant="outline">
            Kicks off {new Date(match.scheduledStart).toLocaleString()}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-3 items-center gap-4">
        <TeamBlock name={match.homeTeam?.name} logo={match.homeTeam?.logoUrl} />

        <div className="text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${match.homeScore}-${match.awayScore}`}
              initial={{ scale: 1.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-4xl font-black tracking-tight"
            >
              {match.homeScore} – {match.awayScore}
            </motion.div>
          </AnimatePresence>
        </div>

        <TeamBlock name={match.awayTeam?.name} logo={match.awayTeam?.logoUrl} reverse />
      </div>
    </div>
  )
}

function TeamBlock({ name, logo, reverse }: { name: string; logo?: string; reverse?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${reverse ? "flex-row-reverse text-right" : ""}`}>
      {logo && <img src={logo} alt={name} className="h-12 w-12 rounded-full object-cover border" />}
      <span className="font-bold text-sm sm:text-base">{name}</span>
    </div>
  )
}