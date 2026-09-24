import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Radio, Users, Trophy, Clock } from "lucide-react"
import Link from "next/link"

export default async function AdminDashboard() {
  const now = new Date();
  const hundredMinsAgo = new Date(now.getTime() - (100 * 60 * 1000));

  const [liveCount, pendingRegistrations, activeSeason, upcomingMatches] = await Promise.all([
    // Logic: If current time is between start and start + 100 mins
    prisma.match.count({ 
      where: { 
        status: { notIn: ["FINISHED", "POSTPONED"] },
        scheduledStart: { lte: now, gte: hundredMinsAgo }
      } 
    }),
    prisma.registration.count({ where: { status: "PENDING" } }),
    prisma.season.findFirst({ where: { status: "ACTIVE" } }),
    prisma.match.findMany({
      where: { scheduledStart: { gte: now }, status: "SCHEDULED" },
      orderBy: { scheduledStart: "asc" },
      take: 5,
      include: { homeTeam: true, awayTeam: true },
    }),
  ])

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-black italic uppercase tracking-tighter">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard icon={<Radio />} label="Live Now" value={liveCount} accent="text-danger" href="/admin/matches" />
        <StatCard icon={<Users />} label="Pending Players" value={pendingRegistrations} accent="text-gold" href="/admin/registrations" />
        <StatCard icon={<Trophy />} label="Active Season" value={activeSeason?.name ?? "None"} accent="text-pitch" href="/admin/tournaments" />
        <StatCard icon={<Clock />} label="Upcoming" value={upcomingMatches.length} accent="text-sky" href="/admin/matches" />
      </div>

      <div className="bg-card border-2 rounded-[2rem] p-8 shadow-sm">
        <h2 className="text-xl font-black uppercase italic mb-6 border-b pb-2 text-pitch-dark">Next Scheduled Matches</h2>
        <div className="space-y-3">
          {upcomingMatches.map((m) => (
            <Link key={m.id} href={`/admin/matches/${m.id}`} className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/40 transition-all group">
              <span className="font-bold group-hover:text-pitch transition-colors">{m.homeTeam.name} vs {m.awayTeam.name}</span>
              <span className="text-sm font-black text-muted-foreground">
                 {new Date(m.scheduledStart).toLocaleDateString()} at {new Date(m.scheduledStart).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, accent, href }: any) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-all rounded-[1.5rem] border-2">
        <CardContent className="p-6 flex items-center gap-4">
          <div className={`${accent} bg-muted p-3 rounded-xl`}>{icon}</div>
          <div>
            <p className="text-2xl font-black leading-none">{value}</p>
            <p className="text-[10px] uppercase font-bold text-muted-foreground mt-1">{label}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}