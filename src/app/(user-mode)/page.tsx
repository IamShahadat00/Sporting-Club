import { prisma } from "@/lib/prisma";
import { SeasonBanner } from "@/components/tournament-hub/SeasonBanner";
import { Badge } from "@/components/ui/badge";
import { Trophy, Activity, AlertCircle, Star, Users, GitBranch, ListOrdered } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function TournamentHubPage() {
  const session = await auth();
  const isAdmin = session?.user && (session.user as any).role === "ADMIN";

  const activeSeason = await prisma.season.findFirst({
    where: { status: "ACTIVE" },
    include: { _count: { select: { registrations: true, matches: true } } },
  });

  if (!activeSeason) return <div className="py-20 text-center font-bold">No Active Season Found</div>;

  // FETCH STATS (Now schema is fixed, this won't error)
  const [topScorers, injured, mvpLeaders] = await Promise.all([
    prisma.player.findMany({ where: { goals: { gt: 0 } }, orderBy: { goals: 'desc' }, include: { team: true }, take: 5 }),
    prisma.player.findMany({ where: { isInjured: true }, include: { team: true } }),
    prisma.player.findMany({ 
      include: { team: true, _count: { select: { mvpAwards: true } } }, 
      orderBy: { mvpAwards: { _count: 'desc' } }, 
      take: 3 
    })
  ]);

  return (
    <div className="pb-20 bg-background">
      <SeasonBanner season={activeSeason} />

      <div className="max-w-6xl mx-auto px-4 mt-8 grid gap-6 sm:grid-cols-3">
        <HubTile href="/tournament-hub/register" icon={<Users />} title="Registration" subtitle={`${activeSeason._count.registrations} Players`} />
        <HubTile href="/tournament-hub/brackets" icon={<GitBranch />} title="Brackets" subtitle="Playoff Road" />
        <HubTile href="/tournament-hub/standings" icon={<ListOrdered />} title="Standings" subtitle="League Table" />
      </div>

      {/* STATS SECTION */}
      <div className="max-w-6xl mx-auto px-4 mt-20">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Tournament Leaders</h2>
            {isAdmin && (
                <Link href="/admin/players">
                    <Badge className="bg-pitch hover:bg-pitch-dark cursor-pointer">Manage Player Stats</Badge>
                </Link>
            )}
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <StatBox title="Top Scorers" icon={<Trophy className="text-gold" />}>
            {topScorers.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  {p.team?.logoUrl && <img src={p.team.logoUrl} className="h-6 w-6 rounded-full border" />}
                  <span className="font-bold text-sm">{p.name}</span>
                </div>
                <span className="text-xl font-black text-pitch">{p.goals}</span>
              </div>
            ))}
          </StatBox>

          <StatBox title="Injury Report" icon={<AlertCircle className="text-danger" />}>
            {injured.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm font-bold">{p.name}</span>
                <Badge variant="outline" className="text-[10px] text-danger border-danger">
                  {p.returnDate ? new Date(p.returnDate).toLocaleDateString() : 'Indefinite'}
                </Badge>
              </div>
            ))}
            {injured.length === 0 && <p className="text-muted-foreground text-sm italic">All players fit.</p>}
          </StatBox>

          <StatBox title="MVP Count" icon={<Star className="text-sky" />}>
             {mvpLeaders.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm font-bold">{p.name}</span>
                <span className="font-black text-sky">{p._count.mvpAwards}</span>
              </div>
            ))}
          </StatBox>
        </div>
      </div>
    </div>
  )
}

function HubTile({ href, icon, title, subtitle }: any) {
  return (
    <Link href={href} className="p-6 border rounded-2xl bg-card hover:border-pitch transition-all hover:shadow-lg">
      <div className="text-pitch mb-2">{icon}</div>
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </Link>
  )
}

function StatBox({ title, icon, children }: any) {
  return (
    <div className="bg-card border rounded-[2rem] p-6 shadow-sm">
      <h3 className="font-black flex items-center gap-2 mb-6 uppercase text-xs tracking-widest">{icon} {title}</h3>
      {children}
    </div>
  )
}