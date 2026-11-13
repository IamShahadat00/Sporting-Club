// src/app/(public)/tournament-hub/page.tsx
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
  CalendarCheck,
  Flame,
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

  // 1. Fetch all matches in season to aggregate goals & weekend ratings
  const seasonMatches = await prisma.match.findMany({
    where: {
      seasonId: activeSeason.id,
      status: { in: ["FINISHED", "LIVE"] },
    },
    include: {
      playerRatings: true,
    },
  });

  // Calculate Golden Boot goals automatically from match events
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

  // 2. Fetch all players, injured squad members, and sponsors
  const [allPlayers, injured, allSponsors] = await Promise.all([
    prisma.player.findMany({
      include: {
        team: true,
        ratings: {
          where: { match: { seasonId: activeSeason.id } },
        },
      },
    }),
    prisma.player.findMany({
      where: { isInjured: true },
      include: { team: true },
      take: 5,
    }),
    prisma.sponsor.findMany({ orderBy: { order: "asc" } }),
  ]);

  // Golden Boot ranking: uses events goal tallies automatically
  const scorersList = allPlayers
    .map((p) => {
      const eventGoals = goalCountMap[p.name.trim().toLowerCase()] || 0;
      const totalGoals = Math.max(p.goals || 0, eventGoals);
      return { ...p, goals: totalGoals };
    })
    .filter((p) => p.goals > 0)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 5);

  // 3. WEEKEND PLAYER OF THE WEEK (POTW) - Calculated on Friday (5) & Saturday (6) matches
  const weekendMatchesMap: Record<string, typeof seasonMatches> = {};
  seasonMatches.forEach((m) => {
    const d = new Date(m.scheduledStart);
    const day = d.getDay();
    if (day === 5 || day === 6) {
      const friday = new Date(d);
      if (day === 6) friday.setDate(friday.getDate() - 1);
      const weekendKey = friday.toISOString().split("T")[0];
      if (!weekendMatchesMap[weekendKey]) weekendMatchesMap[weekendKey] = [];
      weekendMatchesMap[weekendKey].push(m);
    }
  });

  const potwWinnersCount: Record<
    string,
    { count: number; bestRating: number }
  > = {};

  Object.entries(weekendMatchesMap).forEach(([_weekend, matches]) => {
    const playerWeekendRatings: Record<string, { sum: number; count: number }> =
      {};
    matches.forEach((m) => {
      m.playerRatings.forEach((pr) => {
        if (!playerWeekendRatings[pr.playerId]) {
          playerWeekendRatings[pr.playerId] = { sum: 0, count: 0 };
        }
        playerWeekendRatings[pr.playerId].sum += pr.rating;
        playerWeekendRatings[pr.playerId].count += 1;
      });
    });

    let bestPlayerId: string | null = null;
    let maxAvg = 0;

    Object.entries(playerWeekendRatings).forEach(([pid, data]) => {
      const avg = data.sum / data.count;
      if (avg > maxAvg && avg >= 5.0) {
        maxAvg = avg;
        bestPlayerId = pid;
      }
    });

    if (bestPlayerId) {
      if (!potwWinnersCount[bestPlayerId]) {
        potwWinnersCount[bestPlayerId] = { count: 0, bestRating: 0 };
      }
      potwWinnersCount[bestPlayerId].count += 1;
      potwWinnersCount[bestPlayerId].bestRating = Math.max(
        potwWinnersCount[bestPlayerId].bestRating,
        maxAvg,
      );
    }
  });

  const potwLeaderboard = allPlayers
    .filter((p) => potwWinnersCount[p.id]?.count > 0)
    .map((p) => ({
      ...p,
      potwCount: potwWinnersCount[p.id].count,
      bestRating: potwWinnersCount[p.id].bestRating.toFixed(1),
    }))
    .sort((a, b) => b.potwCount - a.potwCount)
    .slice(0, 5);

  // 4. MOST RATED PLAYER (Total rating points & average)
  const mostRatedLeaderboard = allPlayers
    .map((p) => {
      const playerRatings = p.ratings || [];
      const totalPoints = playerRatings.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = playerRatings.length
        ? totalPoints / playerRatings.length
        : 0;
      return {
        ...p,
        totalPoints: Number(totalPoints.toFixed(1)),
        avgRating: Number(avgRating.toFixed(1)),
        ratingCount: playerRatings.length,
      };
    })
    .filter((p) => p.ratingCount > 0)
    .sort((a, b) => b.avgRating - a.avgRating || b.totalPoints - a.totalPoints)
    .slice(0, 5);

  // 5. MAN OF THE MATCH (MVP) - Strictly players with at least 1 MVP award
  const mvpLeaderboard = await prisma.player.findMany({
    where: {
      mvpAwards: {
        some: { match: { seasonId: activeSeason.id } },
      },
    },
    include: {
      _count: {
        select: {
          mvpAwards: { where: { match: { seasonId: activeSeason.id } } },
        },
      },
      team: true,
    },
    orderBy: { mvpAwards: { _count: "desc" } },
    take: 5,
  });

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

      {/* TOURNAMENT ANALYTICS (GRID OF 5 CARDS) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-16 sm:mt-24">
        <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
          <h2 className="text-2xl sm:text-4xl font-black italic uppercase tracking-tighter text-foreground">
            TOURNAMENT <span className="text-pitch">ANALYTICS</span>
          </h2>
          <Activity className="h-8 w-8 text-pitch animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* 1. GOLDEN BOOT CARD (Football ⚽ icon instead of G) */}
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
                  <div className="h-9 w-9 rounded-full bg-muted overflow-hidden shrink-0 border-2 border-border flex items-center justify-center font-bold">
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
                      {p.team?.name || "Team"}
                    </p>
                  </div>
                </div>
                {/* Football icon instead of letter G */}
                <div className="flex items-center gap-1.5 ml-2 font-black text-sm text-pitch">
                  <span className="text-base" role="img" aria-label="Goals">
                    ⚽
                  </span>
                  <span>{p.goals}</span>
                </div>
              </div>
            ))}
            {scorersList.length === 0 && (
              <div className="py-8 text-center text-xs text-muted-foreground italic">
                Goals scored in matches will appear here automatically.
              </div>
            )}
          </StatBox>

          {/* 2. PLAYER OF THE WEEK (Friday & Saturday Weekends) */}
          <StatBox
            title="Player of the Week"
            icon={<CalendarCheck className="text-pitch h-4 w-4" />}
          >
            {potwLeaderboard.map((p) => (
              <div
                key={p.id}
                className="flex justify-between items-center py-3 border-b border-border/50 last:border-0 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-muted overflow-hidden shrink-0 border-2 border-pitch/40 flex items-center justify-center font-bold">
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
                      {p.team?.name || "Team"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-pitch text-xs">
                    {p.potwCount}x POTW
                  </span>
                  <span className="block text-[10px] text-muted-foreground">
                    {p.bestRating}★ Best
                  </span>
                </div>
              </div>
            ))}
            {potwLeaderboard.length === 0 && (
              <div className="py-8 text-center text-xs text-muted-foreground italic">
                Calculated on Friday & Saturday weekend matches.
              </div>
            )}
          </StatBox>

          {/* 3. HIGHEST RATED PLAYER OF TOURNAMENT */}
          <StatBox
            title="Tournament Rating Leader"
            icon={<Flame className="text-sky-500 h-4 w-4" />}
          >
            {mostRatedLeaderboard.map((p, idx) => (
              <div
                key={p.id}
                className="flex justify-between items-center py-3 border-b border-border/50 last:border-0 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-black text-muted-foreground w-4">
                    0{idx + 1}
                  </span>
                  <div className="h-9 w-9 rounded-full bg-muted overflow-hidden shrink-0 border-2 border-sky-500/40 flex items-center justify-center font-bold">
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
                      {p.team?.name || "Team"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-sky-500 text-xs">
                    {p.avgRating}★ Avg
                  </span>
                  <span className="block text-[9px] text-muted-foreground">
                    {p.totalPoints} pts ({p.ratingCount} votes)
                  </span>
                </div>
              </div>
            ))}
            {mostRatedLeaderboard.length === 0 && (
              <div className="py-8 text-center text-xs text-muted-foreground italic">
                Rate players in Match Center to populate rankings.
              </div>
            )}
          </StatBox>

          {/* 4. MAN OF THE MATCH (MVP with Dedicated Photo Frame) */}
          <StatBox
            title="Man of the Match (MVP)"
            icon={<Star className="text-amber-500 h-4 w-4" />}
          >
            {verifiedMvps.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between py-3 border-b border-border/50 last:border-0 text-xs gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Photo Frame with glowing ring & badge */}
                  <div className="relative shrink-0">
                    <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-amber-500 shadow-md bg-muted p-0.5">
                      {p.photoUrl ? (
                        <img
                          src={p.photoUrl}
                          alt=""
                          className="h-full w-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center font-black text-amber-500">
                          {p.name[0]}
                        </div>
                      )}
                    </div>
                    {p.team?.logoUrl && (
                      <img
                        src={p.team.logoUrl}
                        alt=""
                        className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border border-background bg-card object-cover"
                      />
                    )}
                  </div>

                  <div className="truncate min-w-0">
                    <p className="font-bold uppercase truncate text-foreground">
                      {p.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase">
                      {p.team?.name || "Official Squad"}
                    </p>
                  </div>
                </div>

                <span className="font-black text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg text-[10px] shrink-0 border border-amber-500/20">
                  {p._count.mvpAwards} MVP
                </span>
              </div>
            ))}

            {verifiedMvps.length === 0 && (
              <div className="py-8 text-center text-xs text-muted-foreground italic">
                MVPs announced after each match conclusion.
              </div>
            )}
          </StatBox>

          {/* 5. MEDICAL ROOM */}
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
              <div className="py-8 text-center text-xs text-muted-foreground italic">
                Full squad fitness. No injuries reported.
              </div>
            )}
          </StatBox>
        </div>
      </section>

      {/* 4. SPONSOR PARTNERSHIP SHOWCASE - LARGE, HIGH-VISIBILITY GOLD CARDS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-20 sm:mt-28 space-y-8">
        <div className="text-center space-y-2">
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 font-black px-4 py-1 rounded-full uppercase tracking-widest text-[10px]">
            OFFICIAL PARTNERSHIPS
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tighter text-foreground">
            Tournament <span className="text-amber-500">Sponsors</span>
          </h2>
        </div>

        {/* PRIMARY TITLE SPONSOR (HERO BANNER) */}
        {titleSponsor && (
          <div className="bg-card border-4 border-pitch/30 rounded-3xl sm:rounded-[3rem] p-6 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center gap-6 sm:gap-12">
            <div className="shrink-0 p-6 bg-muted/40 rounded-2xl border border-border">
              <img
                src={titleSponsor.logoUrl || ""}
                className="h-28 w-28 sm:h-44 sm:w-44 object-contain"
                alt=""
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
                  "Leading the charge in sports excellence."}
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

        {/* GOLD / MAJOR SPONSORS: LARGE PROMINENT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {otherSponsors.map((s) => (
            <div
              key={s.id}
              className="bg-gradient-to-br from-amber-500/10 via-card to-card border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-xl hover:border-amber-500 transition-all group"
            >
              {/* LARGE SPONSOR LOGO */}
              <div className="h-28 w-40 sm:h-36 sm:w-48 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-md">
                <img
                  src={s.logoUrl || ""}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                  alt={s.name}
                />
              </div>

              {/* SPONSOR DETAILS */}
              <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
                <span className="inline-block bg-amber-500 text-black text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-widest shadow-sm">
                  {s.tier || "GOLD PARTNER"}
                </span>
                <h4 className="font-black text-xl sm:text-2xl uppercase tracking-tight text-foreground truncate">
                  {s.name}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-3 italic leading-relaxed">
                  &quot;
                  {s.description ||
                    "Proud official sponsor of BADC Sporting Club."}
                  &quot;
                </p>
                {s.websiteUrl && (
                  <a
                    href={s.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-amber-500 hover:underline pt-1"
                  >
                    Official Portal <ExternalLink className="h-3 w-3" />
                  </a>
                )}
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
