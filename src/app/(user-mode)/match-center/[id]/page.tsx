import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { parseMatchIdentifier } from "@/app/api/matches/[id]/route";
import { LiveScoreboard } from "@/components/match-center/LiveScoreboard";
import { MatchTimer } from "@/components/match-center/MatchTimer";
import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Users, Play, Video } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MatchDetailPage({ params }: PageProps) {
  const { id } = await params;
  const identifier = parseMatchIdentifier(id);

  // Directly query the database
  const match = await prisma.match.findFirst({
    where:
      identifier.matchNumber !== undefined
        ? { matchNumber: identifier.matchNumber }
        : { id: identifier.id },
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

  // If accessed via the old database CUID ID, automatically redirect to the clean URL!
  if (identifier.id && identifier.matchNumber === undefined) {
    const cleanSlug = `match-${String(match.matchNumber || 1).padStart(2, "0")}`;
    redirect(`/match-center/${cleanSlug}`);
  }

  const isFinished = match.status === "FINISHED";
  const formattedMatchNumber = String(match.matchNumber || 1).padStart(2, "0");

  // Flatten all players to lookup timeline photos
  const allSquadPlayers = [
    ...(match.homeTeam?.players || []),
    ...(match.awayTeam?.players || []),
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      {/* 1. BROADCAST / VIDEO HEADER */}
      <div className="relative aspect-video w-full max-h-[55vh] bg-slate-950 border-b border-border overflow-hidden">
        {match.broadcastUrl && match.broadcastUrl.trim() !== "" ? (
          <iframe
            src={match.broadcastUrl.replace("watch?v=", "embed/")}
            className="w-full h-full"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-slate-900 to-black">
            <Play className="h-16 w-16 text-pitch opacity-30" />
            <p className="font-black uppercase tracking-[0.3em] text-slate-500 text-xs">
              {isFinished ? "Match Concluded" : "Broadcast Channel Offline"}
            </p>
          </div>
        )}

        <div className="absolute top-0 left-0 w-full p-4 sm:p-6 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <div className="pointer-events-auto">
            <BackButton fallbackHref="/match-center" label="Match Center" />
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-16 sm:-mt-20 relative z-10 space-y-10">
        {/* Real-time score board */}
        <LiveScoreboard matchId={match.id} initialData={match} />

        {/* 2. MATCH HIGHLIGHTS VIDEO (Shown when FINISHED) */}
        {isFinished && (match as any).highlightsUrl && (
          <section className="bg-card border-2 border-pitch/30 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-pitch/20 flex items-center justify-center text-pitch">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-pitch">
                    Official Replay
                  </span>
                  <h3 className="text-xl font-black uppercase italic tracking-tight">
                    {(match as any).highlightsTitle ||
                      "Match Highlights & Goals"}
                  </h3>
                </div>
              </div>
              <Badge className="bg-pitch text-black font-black uppercase text-xs">
                HD
              </Badge>
            </div>

            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border bg-black shadow-inner">
              {(match as any).highlightsUrl.includes("youtube.com") ||
              (match as any).highlightsUrl.includes("youtu.be") ? (
                <iframe
                  src={(match as any).highlightsUrl.replace(
                    "watch?v=",
                    "embed/",
                  )}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <video
                  src={(match as any).highlightsUrl}
                  controls
                  className="w-full h-full object-contain"
                  poster={match.mvpAward?.photoUrl || undefined}
                >
                  Your browser does not support HTML5 video.
                </video>
              )}
            </div>
          </section>
        )}

        {/* 3. TIMELINE & LINEUPS WITH PLAYER PHOTOS */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Match Timeline */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                  <Clock className="text-pitch h-5 w-5" /> Match Timeline
                </h2>
                <MatchTimer
                  actualStart={match.actualStart}
                  status={match.status}
                />
              </div>

              <div className="space-y-3">
                {((match.events as any[]) || []).map((e: any, idx: number) => {
                  const playerMatch = allSquadPlayers.find(
                    (p) =>
                      p.name.toLowerCase().trim() ===
                      String(e.player || "")
                        .toLowerCase()
                        .trim(),
                  );

                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-4 p-4 rounded-2xl bg-card border border-border shadow-sm ${
                        e.team === "AWAY" ? "flex-row-reverse text-right" : ""
                      }`}
                    >
                      {/* Player Image on Left */}
                      <div className="relative shrink-0">
                        {playerMatch?.photoUrl ? (
                          <img
                            src={playerMatch.photoUrl}
                            alt={e.player}
                            className="h-12 w-12 rounded-full object-cover border-2 border-border"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-muted border-2 border-border flex items-center justify-center font-black text-sm">
                            {e.player?.[0] || "?"}
                          </div>
                        )}
                        <span className="absolute -bottom-1 -right-1 text-base">
                          {e.type === "GOAL"
                            ? "⚽"
                            : e.type === "YELLOW"
                              ? "🟨"
                              : e.type === "RED"
                                ? "🟥"
                                : "🔄"}
                        </span>
                      </div>

                      {/* Player Name and Event Details on Right */}
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-base uppercase tracking-tight truncate">
                          {e.player}
                        </p>
                        <p className="text-xs font-bold text-pitch">
                          {e.minute}&apos; • {e.type}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {(!match.events || (match.events as any[]).length === 0) && (
                  <p className="text-xs italic text-muted-foreground py-6 text-center border border-dashed border-border rounded-2xl">
                    No match incidents recorded yet.
                  </p>
                )}
              </div>
            </div>

            {/* Tactical Summary */}
            {match.report && (
              <div className="bg-card border border-border p-6 rounded-[2rem] space-y-2">
                <h3 className="font-black uppercase text-xs tracking-widest text-pitch">
                  Tactical Summary
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line font-medium italic">
                  &quot;{match.report}&quot;
                </p>
              </div>
            )}

            {/* Lineups Section with Player Photos on Left */}
            <div className="pt-6 space-y-4">
              <h2 className="text-xl font-black italic uppercase flex items-center gap-2">
                <Users className="text-sky-500 h-5 w-5" /> Lineups
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <SquadList
                  title={match.homeTeam?.name || "Home"}
                  players={match.homeTeam?.players}
                  side="HOME"
                />
                <SquadList
                  title={match.awayTeam?.name || "Away"}
                  players={match.awayTeam?.players}
                  side="AWAY"
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: MVP & PENALTIES */}
          <div className="space-y-6">
            {match.isPenalty && (
              <div className="bg-card border-2 border-sky-500/30 rounded-[2rem] p-6 text-center space-y-2 shadow-lg">
                <h3 className="font-black text-xs uppercase tracking-widest text-sky-500">
                  Penalty Shootout
                </h3>
                <div className="flex justify-center items-center gap-6 text-4xl font-black">
                  <span>{match.homePens}</span>
                  <span className="text-muted-foreground/30">:</span>
                  <span>{match.awayPens}</span>
                </div>
              </div>
            )}

            {/* Man of the Match (MVP) with Photo on Left, Details on Right */}
            <div className="bg-card border-2 border-amber-500/30 rounded-[2rem] p-6 space-y-4 shadow-sm">
              <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-amber-500 flex items-center gap-2">
                <Trophy className="h-4 w-4" /> Man of the Match
              </h3>

              {match.mvpAward ? (
                <div className="flex items-center gap-4 bg-muted/20 p-4 rounded-2xl border border-amber-500/20">
                  {/* Photo on Left */}
                  <div className="shrink-0">
                    {match.mvpAward.photoUrl ||
                    match.mvpAward.player?.photoUrl ? (
                      <img
                        src={
                          match.mvpAward.photoUrl ||
                          match.mvpAward.player?.photoUrl
                        }
                        className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border-2 border-amber-500/50 shadow-md"
                        alt={match.mvpAward.player?.name}
                      />
                    ) : (
                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-muted border-2 border-amber-500/30 flex items-center justify-center font-black text-amber-500 text-xl">
                        MVP
                      </div>
                    )}
                  </div>

                  {/* Name and Citation on Right */}
                  <div className="min-w-0 flex-1">
                    <p className="text-lg sm:text-xl font-black uppercase italic leading-tight truncate">
                      {match.mvpAward.player?.name}
                    </p>
                    <p className="text-xs italic text-muted-foreground mt-1 line-clamp-3">
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

// Squad List Component with Player Image on Left, Name on Right
function SquadList({ title, players, side }: any) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-3 shadow-sm">
      <h3
        className={`font-black text-xs uppercase tracking-wider pb-2 border-b border-border ${
          side === "HOME" ? "text-pitch" : "text-sky-500"
        }`}
      >
        {title}
      </h3>
      <div className="space-y-2.5">
        {players?.map((p: any) => (
          <div
            key={p.id}
            className="flex items-center gap-3 p-2 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors"
          >
            {/* Player Image on the Left */}
            <div className="relative shrink-0">
              {p.photoUrl && p.photoUrl.trim() !== "" ? (
                <img
                  src={p.photoUrl}
                  alt={p.name}
                  className="h-10 w-10 rounded-full object-cover border border-border bg-background"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-muted border border-border flex items-center justify-center font-black text-xs text-muted-foreground">
                  {p.name?.[0] || "?"}
                </div>
              )}
              {p.jerseyNumber && (
                <span className="absolute -bottom-1 -right-1 bg-background text-[9px] font-black border border-border rounded-full px-1 leading-tight">
                  {p.jerseyNumber}
                </span>
              )}
            </div>

            {/* Player Name and Position on the Right */}
            <div className="min-w-0 flex-1">
              <p className="font-bold text-xs uppercase truncate text-foreground">
                {p.name}
              </p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">
                {p.position || "Player"}
              </p>
            </div>
          </div>
        ))}

        {(!players || players.length === 0) && (
          <p className="text-xs text-muted-foreground italic py-3 text-center">
            No squad registered.
          </p>
        )}
      </div>
    </div>
  );
}
