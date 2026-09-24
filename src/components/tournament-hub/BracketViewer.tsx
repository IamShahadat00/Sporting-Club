"use client"

import { motion } from "framer-motion"

interface BracketMatchNode {
  id: string
  round: number
  slotIndex: number
  label: string | null
  match?: { homeTeam: { name: string; logoUrl?: string }; awayTeam: { name: string; logoUrl?: string }; homeScore: number; awayScore: number; status: string } | null
}

export function BracketViewer({ rounds }: { rounds: BracketMatchNode[][] }) {
  return (
    <div className="flex gap-8 overflow-x-auto pb-6">
      {rounds.map((round, roundIdx) => (
        <div key={roundIdx} className="flex flex-col justify-around gap-6 min-w-[220px]">
          <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground text-center">
            {roundLabel(roundIdx, rounds.length)}
          </h4>
          {round.map((node, i) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (roundIdx * round.length + i) * 0.06 }}
              className="rounded-lg border bg-card shadow-sm overflow-hidden"
            >
              <BracketSlot
                name={node.match?.homeTeam.name ?? node.label ?? "TBD"}
                score={node.match?.homeScore}
                winner={node.match && node.match.status === "FINISHED" && node.match.homeScore > node.match.awayScore}
              />
              <div className="border-t" />
              <BracketSlot
                name={node.match?.awayTeam.name ?? "TBD"}
                score={node.match?.awayScore}
                winner={node.match && node.match.status === "FINISHED" && node.match.awayScore > node.match.homeScore}
              />
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  )
}

function BracketSlot({ name, score, winner }: { name: string; score?: number; winner?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-3 py-2 text-sm ${winner ? "bg-pitch-light/50 dark:bg-pitch/10 font-bold" : ""}`}>
      <span className="truncate">{name}</span>
      {score !== undefined && <span className="font-mono ml-2">{score}</span>}
    </div>
  )
}

function roundLabel(idx: number, total: number) {
  const fromEnd = total - idx
  if (fromEnd === 1) return "Final"
  if (fromEnd === 2) return "Semifinal"
  if (fromEnd === 3) return "Quarterfinal"
  return `Round ${idx + 1}`
}