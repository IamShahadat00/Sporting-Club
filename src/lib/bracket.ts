import { prisma } from "@/lib/prisma"

export async function getBracketRounds(seasonId: string) {
  const bracket = await prisma.bracket.findUnique({
    where: { seasonId },
    include: {
      rounds: {
        include: { match: { include: { homeTeam: true, awayTeam: true } } },
        orderBy: [{ round: "asc" }, { slotIndex: "asc" }],
      },
    },
  })
  
  if (!bracket || !bracket.rounds.length) return null

  const maxRound = Math.max(...bracket.rounds.map((n) => n.round))
  const rounds: any[][] = []

  // Logic: Group nodes by round index
  for (let r = 1; r <= maxRound; r++) {
    const roundNodes = bracket.rounds
      .filter((n) => n.round === r)
      .sort((a, b) => a.slotIndex - b.slotIndex)
    rounds.push(roundNodes)
  }
  return rounds
}