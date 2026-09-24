"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Clock,
  Star,
  Trophy,
  Users,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LiveScoreboard } from "@/components/match-center/LiveScoreboard";
import { MatchTimer } from "@/components/match-center/MatchTimer";
import { motion } from "framer-motion";

export default function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [match, setMatch] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/matches/${resolvedParams.id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Match not found");
        return r.json();
      })
      .then((data) => setMatch(data))
      .catch((err) => console.error(err));
  }, [resolvedParams.id]);

  if (!match)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white italic animate-pulse font-black uppercase tracking-widest">
        Connecting to Live Feed...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#020617] text-white pb-20">
      {/* 1. BROADCAST HEADER */}
      <div className="relative aspect-video w-full max-h-[70vh] bg-black border-b border-white/10 group">
        {match.broadcastUrl ? (
          <iframe
            src={match.broadcastUrl.replace("watch?v=", "embed/")}
            className="w-full h-full"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-4 bg-gradient-to-br from-slate-900 to-black">
            <Play className="h-20 w-20 text-pitch opacity-20" />
            <p className="font-black uppercase tracking-[0.4em] text-slate-600">
              Broadcast Offline
            </p>
          </div>
        )}

        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <Link
            href="/match-center"
            className="pointer-events-auto inline-flex items-center gap-2 text-white/70 hover:text-pitch font-black uppercase text-[10px] tracking-widest transition-all group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-2 transition-transform" />{" "}
            Back
          </Link>
          <div className="text-right">
            <Badge className="bg-danger animate-pulse border-none px-4 py-1 mb-2">
              LIVE MATCH #{match.matchNumber}
            </Badge>
            <p className="text-xs font-bold opacity-60 uppercase">
              {match.season.name} · {match.venue}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-20 relative z-10 space-y-12">
        {/* SHARED SCOREBOARD COMPONENT (Should have its own internal null checks) */}
        <LiveScoreboard matchId={match.id} initialData={match} />

        <div className="grid lg:grid-cols-3 gap-12">
          {/* LEFT: TIMELINE & EVENTS */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                <Clock className="text-pitch" /> Match Timeline
              </h2>
              <MatchTimer
                actualStart={match.actualStart}
                status={match.status}
              />
            </div>

            <div className="space-y-4">
              {(match.events as any[])?.map((e, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  key={idx}
                  className={`flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/5 ${e.team === "AWAY" ? "flex-row-reverse text-right" : ""}`}
                >
                  <span className="text-2xl">
                    {e.type === "GOAL"
                      ? "⚽"
                      : e.type === "YELLOW"
                        ? "🟨"
                        : "🟥"}
                  </span>
                  <div className="flex-1">
                    <p className="font-black text-lg uppercase tracking-tight">
                      {e.player}
                    </p>
                    <p className="text-xs font-bold text-pitch">
                      {e.minute}' · {e.type}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* SQUADS SECTION */}
            <div className="pt-10 space-y-10">
              <h2 className="text-2xl font-black italic uppercase flex items-center gap-3">
                <Users className="text-sky" /> Team Lineups
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <SquadList
                  title={match.homeTeam.name}
                  players={match.homeTeam.players}
                  side="HOME"
                />
                <SquadList
                  title={match.awayTeam.name}
                  players={match.awayTeam.players}
                  side="AWAY"
                />
              </div>
            </div>
          </div>

          {/* RIGHT: MVP & PENALTIES */}
          <div className="space-y-8">
            {match.isPenalty && (
              <div className="bg-slate-900 border-2 border-sky/30 rounded-[2rem] p-8 text-center space-y-4 shadow-2xl">
                <h3 className="font-black text-xs uppercase tracking-[0.4em] text-sky">
                  Penalty Shootout
                </h3>
                <div className="flex justify-center items-center gap-8 text-5xl font-black">
                  <span>{match.homePens}</span>
                  <span className="text-white/20">:</span>
                  <span>{match.awayPens}</span>
                </div>
              </div>
            )}

            <div className="bg-amber-500/5 border-2 border-amber-500/20 rounded-[2rem] p-8">
              <h3 className="font-black text-[10px] uppercase tracking-[0.4em] text-amber-500 mb-8 flex items-center gap-2">
                <Trophy className="h-4 w-4" /> Man of the Match
              </h3>
              {match.mvpAward ? (
                <div className="space-y-6">
                  {/* FIX: Check MVP Photo URL */}
                  {match.mvpAward.photoUrl &&
                  match.mvpAward.photoUrl.trim() !== "" ? (
                    <img
                      src={match.mvpAward.photoUrl}
                      className="h-48 w-full object-cover rounded-3xl border-2 border-amber-500/30 shadow-2xl"
                      alt={match.mvpAward.player.name}
                    />
                  ) : (
                    <div className="h-48 w-full bg-slate-800 rounded-3xl flex items-center justify-center border-2 border-white/5 italic text-slate-600 font-bold uppercase text-xs tracking-widest">
                      No Action Photo
                    </div>
                  )}
                  <div className="space-y-2">
                    <p className="text-2xl font-black uppercase italic leading-none">
                      {match.mvpAward.player.name}
                    </p>
                    <p className="text-sm font-medium italic text-slate-400 leading-relaxed">
                      "{match.mvpAward.citation}"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-[10px] font-black opacity-20 uppercase tracking-[0.3em]">
                    Decision Pending
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SquadList({ title, players, side }: any) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-[2rem] p-6">
      <h3
        className={`font-black text-[11px] uppercase mb-6 pb-2 border-b border-white/5 tracking-widest ${side === "HOME" ? "text-pitch" : "text-sky"}`}
      >
        {title} Squad
      </h3>
      <div className="space-y-3">
        {players?.map((p: any) => (
          <div key={p.id} className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-black">
              {p.jerseyNumber}
            </div>
            <span className="text-xs font-bold uppercase tracking-tight">
              {p.name}
            </span>
            <span className="ml-auto text-[8px] font-black text-white/10 uppercase tracking-tighter">
              {p.position}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
