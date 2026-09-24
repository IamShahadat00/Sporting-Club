import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
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
import { MatchReportCard } from "@/components/match-center/MatchReportCard";
import { MatchTimer } from "@/components/match-center/MatchTimer";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminMatchDetailPage({ params }: PageProps) {
  // 1. Await the params for Next.js 16 compliance
  const { id } = await params;

  // 2. Fetch the match with all relations (Teams, Players, Season, MVP)
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

  // 3. Fetch all players from these two teams for the MVP dropdown
  const eligiblePlayers = [
    ...match.homeTeam.players,
    ...match.awayTeam.players,
  ].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* --- 1. BROADCAST & NAVIGATION HEADER --- */}
      <div className="relative aspect-video w-full max-h-[60vh] bg-slate-950 border-b-4 border-pitch/20 group overflow-hidden">
        {match.broadcastUrl && match.broadcastUrl.trim() !== "" ? (
          <iframe
            src={match.broadcastUrl.replace("watch?v=", "embed/")}
            className="w-full h-full"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-4 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.05),_transparent_70%)]">
            <Video className="h-20 w-20 text-pitch opacity-10" />
            <p className="font-black uppercase tracking-[0.4em] text-muted-foreground/30">
              No Live Broadcast Link Set
            </p>
          </div>
        )}

        {/* OVERLAY NAV */}
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start bg-gradient-to-b from-black/80 via-black/20 to-transparent pointer-events-none">
          <Link
            href="/admin/matches"
            className="pointer-events-auto inline-flex items-center gap-2 bg-black/50 backdrop-blur-md text-white px-5 py-2.5 rounded-xl border border-white/10 hover:bg-pitch hover:text-black transition-all group shadow-2xl"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-black uppercase text-[10px] tracking-widest">
              Exit to Center
            </span>
          </Link>

          <div className="text-right space-y-1">
            <Badge className="bg-danger text-white border-none font-black px-4 py-1 animate-pulse">
              ADMIN CONTROL: MATCH #{String(match.matchNumber).padStart(2, "0")}
            </Badge>
            <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">
              {match.season.name} · {match.venue || "Arena TBD"}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-24 relative z-20 space-y-10">
        {/* --- 2. THE SCOREBOARD (Live Data) --- */}
        <LiveScoreboard matchId={match.id} initialData={match} />

        <div className="grid lg:grid-cols-3 gap-10">
          {/* --- LEFT COLUMN: CONTROL & SQUADS --- */}
          <div className="lg:col-span-2 space-y-10">
            {/* LIVE TIMER & STATUS */}
            <div className="flex items-center justify-between bg-card border-2 p-6 rounded-[2rem] shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-pitch/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-pitch" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                    Game Clock
                  </p>
                  <MatchTimer
                    actualStart={match.actualStart}
                    status={match.status}
                  />
                </div>
              </div>
              <Badge
                variant="outline"
                className="h-10 px-6 border-2 font-black uppercase tracking-widest"
              >
                {match.status}
              </Badge>
            </div>

            {/* MAIN CONTROL PANEL (CRUD SCORE/EVENTS/MVP) */}
            <section className="space-y-4">
              <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-pitch" /> Management
                Console
              </h2>
              <MatchControlPanel match={match} players={eligiblePlayers} />
            </section>

            {/* SQUAD LISTINGS */}
            <section className="space-y-6 pt-6">
              <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
                <Users className="h-5 w-5 text-sky" /> Team Lineups
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <SquadBox
                  teamName={match.homeTeam.name}
                  players={match.homeTeam.players}
                  color="border-pitch"
                />
                <SquadBox
                  teamName={match.awayTeam.name}
                  players={match.awayTeam.players}
                  color="border-sky"
                />
              </div>
            </section>
          </div>

          {/* --- RIGHT COLUMN: REPORT PREVIEW & PENALTIES --- */}
          <div className="space-y-8">
            {/* PENALTY DISPLAY (If active) */}
            {match.isPenalty && (
              <div className="bg-slate-900 border-b-4 border-sky text-white p-8 rounded-[2.5rem] text-center shadow-2xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-sky/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-sky mb-4 relative z-10">
                  Penalty Shootout
                </p>
                <div className="flex justify-center items-center gap-8 text-6xl font-black tabular-nums relative z-10">
                  <span className="drop-shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                    {match.homePens}
                  </span>
                  <span className="text-white/10">:</span>
                  <span className="drop-shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                    {match.awayPens}
                  </span>
                </div>
              </div>
            )}

            {/* MVP STATUS */}
            <div className="bg-card border-2 rounded-[2.5rem] p-8 shadow-sm">
              <h3 className="font-black text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-8 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" /> Man of the Match
              </h3>
              {match.mvpAward ? (
                <div className="space-y-6">
                  {match.mvpAward.photoUrl &&
                  match.mvpAward.photoUrl.trim() !== "" ? (
                    <img
                      src={match.mvpAward.photoUrl}
                      className="h-48 w-full object-cover rounded-3xl border-2 border-amber-500/20 shadow-xl"
                      alt=""
                    />
                  ) : (
                    <div className="h-48 w-full bg-muted rounded-3xl flex items-center justify-center font-black text-muted-foreground/20 text-xs tracking-widest uppercase">
                      No Photo
                    </div>
                  )}
                  <div>
                    <p className="text-2xl font-black uppercase italic leading-none">
                      {match.mvpAward.player.name}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground mt-3 italic leading-relaxed">
                      "{match.mvpAward.citation}"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center border-2 border-dashed rounded-3xl opacity-30 italic font-bold text-xs uppercase tracking-widest">
                  Decision Awaited
                </div>
              )}
            </div>

            {/* QUICK INFO */}
            <div className="bg-muted/30 p-8 rounded-[2.5rem] border-2 space-y-4">
              <h4 className="font-black uppercase text-[10px] tracking-widest">
                Venue Details
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs font-bold">
                  <Info className="h-4 w-4 text-pitch" />
                  {match.venue || "Standard BADC Arena"}
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <Clock className="h-4 w-4 text-pitch" />1 Hour Professional
                  Half-Time
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- INTERNAL SQUAD COMPONENT ---
function SquadBox({ teamName, players, color }: any) {
  return (
    <div className={`bg-card border-2 rounded-[2.5rem] p-8 ${color}/20`}>
      <h3
        className={`font-black text-xs uppercase mb-6 pb-2 border-b-2 tracking-widest ${color.replace("border", "text")}`}
      >
        {teamName} Squad
      </h3>
      <div className="space-y-3">
        {players?.map((p: any) => (
          <div key={p.id} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-muted-foreground w-4 group-hover:text-pitch transition-colors">
                {String(p.jerseyNumber).padStart(2, "0")}
              </span>
              <span className="text-xs font-bold uppercase tracking-tight group-hover:pl-1 transition-all">
                {p.name}
              </span>
            </div>
            <span className="text-[8px] font-black opacity-20 group-hover:opacity-100 transition-opacity uppercase">
              {p.position}
            </span>
          </div>
        ))}
        {(!players || players.length === 0) && (
          <p className="text-[10px] italic text-muted-foreground opacity-50">
            No players registered.
          </p>
        )}
      </div>
    </div>
  );
}
