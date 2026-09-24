import { prisma } from "@/lib/prisma"

export async function recalculateStanding(seasonId: string, teamId: string) {
  const matches = await prisma.match.findMany({
    where: { 
      seasonId, 
      status: "FINISHED", 
      OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }] 
    },
  })

  let played = 0, won = 0, drawn = 0, lost = 0, gf = 0, ga = 0

  for (const m of matches) {
    played++
    const isHome = m.homeTeamId === teamId
    const teamScore = isHome ? m.homeScore : m.awayScore
    const oppScore = isHome ? m.awayScore : m.homeScore

    gf += teamScore
    ga += oppScore

    if (teamScore > oppScore) won++
    else if (teamScore === oppScore) drawn++
    else lost++
  }

  const points = won * 3 + drawn
  const goalDiff = gf - ga

  await prisma.standing.upsert({
    where: { seasonId_teamId: { seasonId, teamId } },
    create: { seasonId, teamId, played, won, drawn, lost, points, goalDiff, goalsFor: gf, goalsAgainst: ga },
    update: { played, won, drawn, lost, points, goalDiff, goalsFor: gf, goalsAgainst: ga },
  })
}