// src/app/admin/matches/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Trophy,
  Users,
  Video,
  ShieldCheck,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LiveScoreboard } from "@/components/match-center/LiveScoreboard";
import { MatchControlPanel } from "@/components/admin/matchcontrolpanel";
import { MatchTimer } from "@/components/match-center/MatchTimer";
import { SofascorePitchFormation } from "@/components/match-center/SofascorePitchFormation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminMatchDetailPage({ params }: PageProps) {
  const { id } = await params;

  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      homeTeam: {
        include: { players: { orderBy: { name: "asc" } } },
      },
      awayTeam: {
        include: { players: { orderBy: { name: "asc" } } },
      },
      season: true,
      mvpAward: { include: { player: true } },
    },
  });

  if (!match) notFound();

  // Combine both squads for the searchable MVP selection
  const eligiblePlayers = [
    ...(match.homeTeam?.players || []),
    ...(match.awayTeam?.players || []),
  ].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 space-y-8">
      {/* 1. BROADCAST & TOP NAVIGATION HEADER */}
      <div className="relative aspect-video w-full max-h-[50vh] bg-slate-950 border-b-2 border-border overflow-hidden">
        {match.broadcastUrl && match.broadcastUrl.trim() !== "" ? (
          <iframe
            src={match.broadcastUrl.replace("watch?v=", "embed/")}
            className="w-full h-full"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-slate-900 to-black text-slate-500">
            <Video className="h-14 w-14 text-pitch opacity-30" />
            <p className="font-black uppercase tracking-[0.3em] text-xs">
              No Live Broadcast Stream Attached
            </p>
          </div>
        )}

        <div className="absolute top-0 left-0 w-full p-4 sm:p-6 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <Link
            href="/admin/matches"
            className="pointer-events-auto inline-flex items-center gap-2 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-xl border border-white/10 hover:bg-pitch hover:text-black transition-all text-xs font-black uppercase"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Matches
          </Link>

          <div className="text-right space-y-1">
            <Badge className="bg-danger text-white border-none font-black text-xs px-3 py-1 animate-pulse">
              ADMIN CONTROL: MATCH #
              {String(match.matchNumber || 1).padStart(2, "0")}
            </Badge>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
              {match.season.name} • {match.venue || "BADC Arena"}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-14 relative z-20 space-y-8">
        {/* SCOREBOARD */}
        <LiveScoreboard matchId={match.id} initialData={match} />

        {/* 2. ADMIN INTERACTIVE TACTICAL FORMATION & RATINGS CONSOLE */}
        <SofascorePitchFormation
          match={match}
          homeTeam={match.homeTeam}
          awayTeam={match.awayTeam}
          isAdmin={true}
        />

        {/* 3. MANAGEMENT GRID */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* GAME CLOCK */}
            <div className="flex items-center justify-between bg-card border border-border p-5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-pitch/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-pitch" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                    Match Clock (45m Rules)
                  </p>
                  <MatchTimer
                    actualStart={match.actualStart}
                    status={match.status}
                  />
                </div>
              </div>
              <Badge
                variant="outline"
                className="border-border text-xs font-black uppercase"
              >
                {match.status}
              </Badge>
            </div>

            {/* LIVE SCORE & FINALIZATION CONSOLE */}
            <section className="space-y-3">
              <h2 className="text-lg font-black uppercase italic tracking-tight flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-pitch" /> Match Console
              </h2>
              <MatchControlPanel match={match} players={eligiblePlayers} />
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* PENALTY STATUS */}
            {match.isPenalty && (
              <div className="bg-card border-2 border-sky-500/30 p-6 rounded-2xl text-center space-y-2 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-sky-500">
                  Penalty Shootout
                </p>
                <div className="flex justify-center items-center gap-6 text-4xl font-black">
                  <span>{match.homePens}</span>
                  <span className="text-muted-foreground/30">:</span>
                  <span>{match.awayPens}</span>
                </div>
              </div>
            )}

            {/* MVP STATUS WITH PHOTO FRAME */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-black text-xs uppercase tracking-widest text-amber-500 flex items-center gap-1.5">
                <Trophy className="h-4 w-4" /> Man of the Match
              </h3>

              {match.mvpAward ? (
                <div className="space-y-3">
                  <div className="relative h-44 w-full rounded-xl overflow-hidden bg-muted border-2 border-amber-500/40">
                    {match.mvpAward.photoUrl ||
                    match.mvpAward.player?.photoUrl ? (
                      <img
                        src={
                          match.mvpAward.photoUrl ||
                          match.mvpAward.player?.photoUrl
                        }
                        className="h-full w-full object-cover"
                        alt=""
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center font-black text-amber-500 text-2xl">
                        MVP
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xl font-black uppercase italic text-foreground">
                      {match.mvpAward.player?.name}
                    </p>
                    <p className="text-xs italic text-muted-foreground mt-1">
                      &quot;{match.mvpAward.citation}&quot;
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs italic text-muted-foreground text-center py-6">
                  No MVP awarded yet. Use the button above to finalize.
                </p>
              )}
            </div>

            {/* VENUE DETAILS CORRECTION (Point 5) */}
            <div className="bg-card border border-border p-6 rounded-2xl space-y-3 shadow-sm">
              <h4 className="font-black uppercase text-xs tracking-wider text-muted-foreground">
                Venue & Tournament Rules
              </h4>
              <div className="space-y-2 text-xs font-bold text-foreground">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-pitch shrink-0" />
                  <span>{match.venue || "BADC Arena Grounds"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-pitch shrink-0" />
                  {/* Corrected tournament game time */}
                  <span>45m Match: 20m 1st Half • 5m Break • 20m 2nd Half</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
