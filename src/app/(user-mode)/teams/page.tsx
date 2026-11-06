import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, MapPin } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

export default async function TeamsPage() {
  const teams = await prisma.team.findMany({
    include: { _count: { select: { players: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-14 space-y-8 min-h-screen">
      <BackButton fallbackHref="/" label="Return to Arena" />

      <div className="space-y-1">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-foreground">
          OFFICIAL <span className="text-pitch">TEAMS</span>
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm font-medium">
          Select a club to explore roster statistics, team philosophy, and squad history.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {teams.map((team) => (
          <Link href={`/teams/${team.id}`} key={team.id} className="group block h-full">
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 hover:border-pitch/60 hover:shadow-lg transition-all h-full">
              {team.logoUrl ? (
                <img
                  src={team.logoUrl}
                  alt={team.name}
                  className="h-24 w-24 sm:h-28 sm:w-28 rounded-full object-cover border-2 border-border shadow-md shrink-0 bg-background"
                />
              ) : (
                <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-muted flex items-center justify-center font-black text-3xl text-muted-foreground shrink-0 border border-border">
                  {team.name[0]}
                </div>
              )}

              <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground group-hover:text-pitch transition-colors truncate">
                  {team.name}
                </h3>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-bold text-muted-foreground pt-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-pitch" />
                    <span>{team.district || "Dhaka"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-pitch" />
                    <span>{team._count.players} Players</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 italic pt-1">
                  &quot;{team.description || "Representing excellence and integrity in BADC tournament football."}&quot;
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}