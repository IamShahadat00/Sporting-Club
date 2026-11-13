// src/app/(public)/match-center/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { parseMatchIdentifier } from "@/app/api/matches/[id]/route";
import { LiveScoreboard } from "@/components/match-center/LiveScoreboard";
import { MatchTimer } from "@/components/match-center/MatchTimer";
import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Play, Video } from "lucide-react";
import { SofascorePitchFormation } from "@/components/match-center/SofascorePitchFormation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MatchDetailPage({ params }: PageProps) {
  const { id } = await params;
  const identifier = parseMatchIdentifier(id);

  const match = await prisma.match.findFirst({
    where: {
      OR: [
        { id: identifier.raw },
        ...(identifier.matchNumber !== undefined
          ? [{ matchNumber: identifier.matchNumber }]
          : []),
      ],
    },
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

  // Redirect legacy CUIDs to clean slugs
  if (identifier.id && identifier.matchNumber === undefined) {
    const cleanSlug = `match-${String(match.matchNumber || 1).padStart(2, "0")}`;
    redirect(`/match-center/${cleanSlug}`);
  }

  const isFinished = match.status === "FINISHED";
  const formattedMatchNumber = String(match.matchNumber || 1).padStart(2, "0");

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      {/* 1. BROADCAST HEADER */}
      <div className="relative aspect-video w-full max-h-[50vh] bg-slate-950 border-b border-border overflow-hidden">
        {match.broadcastUrl && match.broadcastUrl.trim() !== "" ? (
          <iframe
            src={match.broadcastUrl.replace("watch?v=", "embed/")}
            className="w-full h-full"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-slate-900 to-black">
            <Play className="h-14 w-14 text-pitch opacity-30" />
            <p className="font-black uppercase tracking-[0.3em] text-slate-500 text-xs">
              {isFinished
                ? "Match Concluded (45 mins)"
                : "Live Match Broadcast Offline"}
            </p>
          </div>
        )}

        <div className="absolute top-0 left-0 w-full p-4 sm:p-6 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <div className="pointer-events-auto">
            <BackButton
              fallbackHref="/match-center"
              forceHref="/match-center"
              label="Match Center"
            />
          </div>

          <div className="text-right">
            <Badge
              className={`${
                isFinished
                  ? "bg-slate-700 text-white"
                  : "bg-danger text-white animate-pulse"
              } border-none px-3 py-1 mb-1 font-black text-xs uppercase`}
            >
              {match.status} • MATCH #{formattedMatchNumber}
            </Badge>
            <p className="text-[11px] font-bold text-slate-300 uppercase">
              {match.season?.name} • {match.venue || "BADC Arena"}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-14 relative z-10 space-y-10">
        {/* Real-time score board */}
        <LiveScoreboard matchId={match.id} initialData={match} />

        {/* 2. SOFASCORE 8-A-SIDE (1-3-2-2) PITCH FORMATION & RATING SYSTEM */}
        <SofascorePitchFormation
          match={match}
          homeTeam={match.homeTeam}
          awayTeam={match.awayTeam}
        />

        {/* 3. TIMELINE & MVP */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                <Clock className="text-pitch h-5 w-5" /> Match Timeline (45m
                Tournament Clock)
              </h2>
              <MatchTimer
                actualStart={match.actualStart}
                status={match.status}
              />
            </div>

            {/* Events List */}
            <div className="space-y-3">
              {((match.events as any[]) || []).map((e: any, idx: number) => (
                <div
                  key={idx}
                  className={`flex items-center gap-4 p-3.5 rounded-2xl bg-card border border-border shadow-sm ${
                    e.team === "AWAY" ? "flex-row-reverse text-right" : ""
                  }`}
                >
                  <span className="text-xl">
                    {e.type === "GOAL"
                      ? "⚽"
                      : e.type === "YELLOW"
                        ? "🟨"
                        : e.type === "RED"
                          ? "🟥"
                          : "🔄"}
                  </span>
                  <div className="flex-1">
                    <p className="font-black text-sm uppercase tracking-tight">
                      {e.player}
                    </p>
                    <p className="text-[11px] font-bold text-pitch">
                      {e.minute}&apos; • {e.type}
                    </p>
                  </div>
                </div>
              ))}

              {(!match.events || (match.events as any[]).length === 0) && (
                <p className="text-xs italic text-muted-foreground py-6 text-center border border-dashed border-border rounded-2xl">
                  No incidents logged yet.
                </p>
              )}
            </div>

            {match.report && (
              <div className="bg-card border border-border p-6 rounded-[2rem] space-y-2">
                <h3 className="font-black uppercase text-xs tracking-widest text-pitch">
                  Tactical Summary
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line italic">
                  &quot;{match.report}&quot;
                </p>
              </div>
            )}
          </div>

          {/* RIGHT: MVP */}
          <div className="space-y-6">
            <div className="bg-card border-2 border-amber-500/30 rounded-[2rem] p-6 space-y-4 shadow-sm">
              <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-amber-500 flex items-center gap-2">
                <Trophy className="h-4 w-4" /> Man of the Match
              </h3>

              {match.mvpAward ? (
                <div className="flex items-center gap-4 bg-muted/20 p-4 rounded-2xl border border-amber-500/20">
                  <div className="h-16 w-16 rounded-2xl overflow-hidden bg-muted border-2 border-amber-500/50 shrink-0">
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
                      <div className="h-full w-full flex items-center justify-center font-black text-amber-500">
                        MVP
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-black uppercase italic leading-tight">
                      {match.mvpAward.player?.name}
                    </p>
                    <p className="text-xs italic text-muted-foreground mt-1">
                      &quot;{match.mvpAward.citation}&quot;
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs italic text-muted-foreground text-center py-6">
                  Award will be announced after match conclusion.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
