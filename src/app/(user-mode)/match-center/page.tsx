import { prisma } from "@/lib/prisma"
import { MatchCenterContent } from "@/components/shared/MatchCenterContent"

export default async function MatchCenterPage() {
  const now = new Date();
  const startToday = new Date(new Date().setHours(0,0,0,0));
  const endToday = new Date(new Date().setHours(23,59,59,999));

  const [today, upcoming, past] = await Promise.all([
    prisma.match.findMany({ 
        where: { scheduledStart: { gte: startToday, lte: endToday } }, 
        include: { homeTeam: true, awayTeam: true } 
    }),
    prisma.match.findMany({ 
        where: { scheduledStart: { gt: endToday }, status: "SCHEDULED" }, 
        include: { homeTeam: true, awayTeam: true }, 
        take: 10,
        orderBy: { scheduledStart: 'asc' }
    }),
    prisma.match.findMany({ 
        where: { status: "FINISHED" }, 
        include: { homeTeam: true, awayTeam: true }, 
        orderBy: { updatedAt: "desc" }, 
        take: 10 
    }),
  ]);

  return <MatchCenterContent today={today} upcoming={upcoming} past={past} isAdmin={false} />;
}