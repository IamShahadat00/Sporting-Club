import { prisma } from "@/lib/prisma";
import { SeasonBanner } from "@/components/tournament-hub/SeasonBanner";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/ui/back-button";
import Link from "next/link";
import {
  Trophy,
  Users,
  GitBranch,
  ListOrdered,
  Star,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Activity,
} from "lucide-react";

export default async function TournamentHubPage() {
  const activeSeason = await prisma.season.findFirst({
    where: { status: "ACTIVE" },
    include: { _count: { select: { registrations: true, matches: true } } },
  });

  if (!activeSeason) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center">
        <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-30" />
        <h1 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tight text-foreground">
          No Active Tournament
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          The board is currently organizing the next season. Stay tuned.
        </p>
        <div className="mt-6">
          <BackButton fallbackHref="/" forceHref="/" label="Return to Arena" />
        </div>
      </div>
    );
  }

  // 1. Fetch Matches to calculate real-time goal tallies from match events
  const seasonMatches = await prisma.match.findMany({
    where: {
      seasonId: activeSeason.id,
      status: { in: ["FINISHED", "LIVE"] },
    },
    select: { events: true },
  });

  // Calculate goals per player from logged match events
  const goalCountMap: Record<string, number> = {};
  seasonMatches.forEach((m) => {
    const evts = (m.events as any[]) || [];
    evts.forEach((e) => {
      if (e?.type === "GOAL" && e?.player) {
        const playerName = String(e.player).trim().toLowerCase();
        goalCountMap[playerName] = (goalCountMap[playerName] || 0) + 1;
      }
    });
  });

  // 2. Fetch all players, injured players, and sponsors
  const [allPlayers, injured, allSponsors] = await Promise.all([
    prisma.player.findMany({
      include: { team: true },
    }),
    prisma.player.findMany({
      where: { isInjured: true },
      include: { team: true },
      take: 5,
    }),
    prisma.sponsor.findMany({ orderBy: { order: "asc" } }),
  ]);

  // 3. Golden Boot: Aggregate goals from match events + player record
  const scorersList = allPlayers
    .map((p) => {
      const eventGoals = goalCountMap[p.name.trim().toLowerCase()] || 0;
      const totalGoals = Math.max(p.goals || 0, eventGoals);
      return { ...p, goals: totalGoals };
    })
    .filter((p) => p.goals > 0)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 5);

  // 4. MVP Leaderboard: STRICTLY FILTER to players who have won at least 1 MVP
  const mvpLeaderboard = await prisma.player.findMany({
    where: {
      mvpAwards: {
        some: {
          match: { seasonId: activeSeason.id },
        },
      },
    },
    include: {
      _count: {
        select: {
          mvpAwards: {
            where: { match: { seasonId: activeSeason.id } },
          },
        },
      },
      team: true,
    },
    orderBy: {
      mvpAwards: { _count: "desc" },
    },
    take: 5,
  });

  // Ensure 0-MVP players are never displayed
  const verifiedMvps = mvpLeaderboard.filter(
    (p) => (p._count?.mvpAwards || 0) > 0,
  );

  const titleSponsor = allSponsors.find(
    (s) => s.tier.toUpperCase() === "TITLE",
  );
  const otherSponsors = allSponsors.filter(
    (s) => s.tier.toUpperCase() !== "TITLE",
  );

  return (
    <div className="pb-24 bg-background text-foreground min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <BackButton fallbackHref="/" forceHref="/" label="Return to Arena" />
      </div>

      <div className="mt-4">
        <SeasonBanner season={activeSeason} />
      </div>

      {/* NAVIGATION TILES */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-10 sm:-mt-14 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3 relative z-10">
        <HubCard
          href="/tournament-hub/register"
          icon={<Users className="h-6 w-6 sm:h-7 sm:w-7" />}
          title="Registration"
          sub={`${activeSeason._count.registrations} Enrolled`}
          color="bg-pitch"
        />
        <HubCard
          href="/tournament-hub/brackets"
          icon={<GitBranch className="h-6 w-6 sm:h-7 sm:w-7" />}
          title="Playoffs"
          sub="Elimination Tree"
          color="bg-sky-500"
        />
        <HubCard
          href="/tournament-hub/standings"
          icon={<ListOrdered className="h-6 w-6 sm:h-7 sm:w-7" />}
          title="Standings"
          sub="Official Points Table"
          color="bg-amber-500"
        />
      </div>

      {/* TOURNAMENT ANALYTICS (Golden Boot & Filtered MVPs) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-20 sm:mt-28">
        <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
          <h2 className="text-2xl sm:text-4xl font-black italic uppercase tracking-tighter text-foreground">
            TOURNAMENT <span className="text-pitch">ANALYTICS</span>
          </h2>
          <Activity className="h-8 w-8 text-pitch animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* 1. GOLDEN BOOT CARD (Calculates automatically from goal events) */}
          <StatBox
            title="Golden Boot"
            icon={<Trophy className="text-amber-500 h-4 w-4" />}
          >
            {scorersList.map((p, idx) => (
              <div
                key={p.id}
                className="flex justify-between items-center py-3 border-b border-border/50 last:border-0 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-black text-muted-foreground w-4">
                    0{idx + 1}
                  </span>
                  <div className="h-8 w-8 rounded-full bg-muted overflow-hidden shrink-0 border border-border flex items-center justify-center font-bold">
                    {p.photoUrl ? (
                      <img
                        src={p.photoUrl}
                        className="h-full w-full object-cover"
                        alt=""
                      />
                    ) : (
                      p.name[0]
                    )}
                  </div>
                  <div className="truncate">
                    <p className="font-bold uppercase truncate text-foreground">
                      {p.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase">
                      {p.team?.name || "Free Agent"}
                    </p>
                  </div>
                </div>
                <span className="text-lg font-black text-pitch ml-2">
                  {p.goals} ⚽
                </span>
              </div>
            ))}

            {scorersList.length === 0 && (
              <div className="py-12 px-4 text-center border-2 border-dashed border-border rounded-2xl">
                <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                  The hunt for goals begins with Match #01
                </p>
              </div>
            )}
          </StatBox>

          {/* 2. MEDICAL ROOM CARD */}
          <StatBox
            title="Medical Room"
            icon={<AlertCircle className="text-danger h-4 w-4" />}
          >
            {injured.map((p) => (
              <div
                key={p.id}
                className="flex justify-between items-center py-3 border-b border-border/50 last:border-0 text-xs"
              >
                <div className="truncate">
                  <p className="font-bold uppercase truncate text-foreground">
                    {p.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase">
                    {p.team?.name || "Squad"}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-[9px] text-danger border-danger"
                >
                  Out
                </Badge>
              </div>
            ))}

            {injured.length === 0 && (
              <div className="py-12 px-4 text-center border-2 border-dashed border-border rounded-2xl">
                <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                  Full squad fitness. No injuries reported.
                </p>
              </div>
            )}
          </StatBox>

          {/* 3. PERFORMANCE / MVP (Strictly verified winners only) */}
          <StatBox
            title="Performance (MVP)"
            icon={<Star className="text-sky-500 h-4 w-4" />}
          >
            {verifiedMvps.map((p) => (
              <div
                key={p.id}
                className="flex justify-between items-center py-3 border-b border-border/50 last:border-0 text-xs"
              >
                <div className="truncate min-w-0 pr-2">
                  <p className="font-bold uppercase truncate text-foreground">
                    {p.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase">
                    {p.team?.name || "Official Team"}
                  </p>
                </div>
                <span className="font-black text-sky-500 bg-sky-500/10 px-2.5 py-1 rounded-lg text-[10px] shrink-0 border border-sky-500/20">
                  {p._count.mvpAwards} MVP
                </span>
              </div>
            ))}

            {verifiedMvps.length === 0 && (
              <div className="py-12 px-4 text-center border-2 border-dashed border-border rounded-2xl">
                <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                  Awards will be announced after match conclusion.
                </p>
              </div>
            )}
          </StatBox>
        </div>
      </section>

      {/* TITLE & BRAND PARTNERS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-20 sm:mt-28">
        <div className="text-center mb-10 sm:mb-14 space-y-2">
          <Badge className="bg-pitch/10 text-pitch border-pitch/30 font-black px-4 py-1 rounded-full uppercase tracking-widest text-[10px]">
            PARTNERSHIPS
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tighter text-foreground">
            The Driving <span className="text-pitch">Force</span>
          </h2>
        </div>

        {titleSponsor && (
          <div className="bg-card border-2 border-pitch/30 rounded-3xl sm:rounded-[3rem] p-6 sm:p-12 mb-8 shadow-xl flex flex-col md:flex-row items-center gap-6 sm:gap-12">
            <div className="shrink-0 p-6 bg-muted/40 rounded-2xl border border-border">
              <img
                src={titleSponsor.logoUrl || ""}
                className="h-28 w-28 sm:h-44 sm:w-44 object-contain"
                alt={titleSponsor.name}
              />
            </div>
            <div className="flex-1 text-center md:text-left space-y-3">
              <span className="inline-block px-3 py-1 bg-pitch text-white text-[10px] font-black uppercase rounded-md tracking-wider">
                PRIMARY TITLE SPONSOR
              </span>
              <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
                {titleSponsor.name}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm italic leading-relaxed">
                &quot;
                {titleSponsor.description ||
                  "Leading the charge in professional sports and community excellence."}
                &quot;
              </p>
              {titleSponsor.websiteUrl && (
                <a
                  href={titleSponsor.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-xl font-black uppercase text-xs hover:bg-pitch hover:text-white transition-all shadow-md mt-2"
                >
                  Visit Portal <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {otherSponsors.map((s) => (
            <div
              key={s.id}
              className="bg-card border border-border rounded-2xl p-5 sm:p-6 flex items-center gap-4 hover:border-pitch/50 transition-all shadow-sm"
            >
              <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 bg-muted/30 rounded-xl p-2 border border-border flex items-center justify-center">
                <img
                  src={s.logoUrl || ""}
                  className="max-h-full max-w-full object-contain"
                  alt={s.name}
                />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <span className="text-[9px] font-black text-pitch uppercase tracking-wider">
                  {s.tier}
                </span>
                <h4 className="font-black text-base uppercase truncate text-foreground">
                  {s.name}
                </h4>
                <p className="text-[11px] text-muted-foreground line-clamp-2 italic">
                  &quot;{s.description}&quot;
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function HubCard({ href, icon, title, sub, color }: any) {
  return (
    <Link href={href} className="group h-full">
      <div className="bg-card border border-border p-5 sm:p-7 rounded-2xl sm:rounded-3xl shadow-sm hover:border-pitch/60 hover:shadow-md transition-all h-full flex flex-col justify-between">
        <div
          className={`${color} w-11 h-11 rounded-xl flex items-center justify-center text-white mb-4 shadow-sm`}
        >
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-black uppercase tracking-tight text-foreground mb-1">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground font-bold flex items-center justify-between">
            {sub}{" "}
            <ArrowRight className="h-3.5 w-3.5 text-pitch group-hover:translate-x-1 transition-transform" />
          </p>
        </div>
      </div>
    </Link>
  );
}

function StatBox({ title, icon, children }: any) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted-foreground pb-2 border-b border-border">
        {icon} {title}
      </div>
      <div>{children}</div>
    </div>
  );
}
