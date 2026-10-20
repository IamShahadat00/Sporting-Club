"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Trophy, Play, Video, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LiveScoreboard } from "@/components/match-center/LiveScoreboard";
import { MatchTimer } from "@/components/match-center/MatchTimer";
import { useLiveMatch } from "@/hooks/useLiveMatch";
import { motion } from "framer-motion";

export default function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  // Real-time polling without Supabase:
  const match = useLiveMatch(resolvedParams.id, null);

  if (!match) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white italic font-black uppercase tracking-widest animate-pulse">
        Connecting to Match Center...
      </div>
    );
  }

  const isFinished = match.status === "FINISHED";

  return (
    <div className="min-h-screen bg-[#020617] text-white pb-32">
      {/* 1. HEADER / BROADCAST BAR */}
      <div className="relative aspect-video w-full max-h-[60vh] bg-black border-b border-white/10 overflow-hidden">
        {match.broadcastUrl ? (
          <iframe
            src={match.broadcastUrl.replace("watch?v=", "embed/")}
            className="w-full h-full"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-4 bg-gradient-to-br from-slate-900 to-black">
            <Play className="h-16 w-16 text-pitch opacity-20" />
            <p className="font-black uppercase tracking-[0.4em] text-slate-600 text-xs">
              {isFinished ? "Match Concluded" : "Live Broadcast Channel"}
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
            <Badge
              className={`${isFinished ? "bg-slate-700" : "bg-danger animate-pulse"} border-none px-4 py-1 mb-2`}
            >
              {match.status} #{match.matchNumber}
            </Badge>
            <p className="text-xs font-bold opacity-60 uppercase">
              {match.season?.name} • {match.venue || "BADC Arena"}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-20 relative z-10 space-y-12">
        {/* Real-time score board */}
        <LiveScoreboard matchId={match.id} initialData={match} />

        {/* 2. FINISHED MATCH: VIDEO MEDIA PLAYER / HIGHLIGHTS SECTION */}
        {isFinished && match.highlightsUrl && (
          <section className="bg-slate-900/80 border-2 border-pitch/30 rounded-[3rem] p-8 md:p-12 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-pitch/20 flex items-center justify-center text-pitch">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-pitch">
                    Official Highlights
                  </span>
                  <h3 className="text-2xl font-black uppercase italic tracking-tight">
                    {match.highlightsTitle || "Match Highlights & Goals"}
                  </h3>
                </div>
              </div>
              <Badge className="bg-pitch text-black font-black uppercase text-xs">
                HD Replay
              </Badge>
            </div>

            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-black shadow-inner">
              {match.highlightsUrl.includes("youtube.com") ||
              match.highlightsUrl.includes("youtu.be") ? (
                <iframe
                  src={match.highlightsUrl.replace("watch?v=", "embed/")}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <video
                  src={match.highlightsUrl}
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

        {/* 3. SOFASCORE / FOTMOB EVENT TIMELINE */}
        <div className="grid lg:grid-cols-3 gap-12">
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
              {(match.events as any[])?.map((e: any, idx: number) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  key={idx}
                  className={`flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/5 ${
                    e.team === "AWAY" ? "flex-row-reverse text-right" : ""
                  }`}
                >
                  <span className="text-2xl">
                    {e.type === "GOAL"
                      ? "⚽"
                      : e.type === "YELLOW"
                        ? "🟨"
                        : e.type === "RED"
                          ? "🟥"
                          : "🔄"}
                  </span>
                  <div className="flex-1">
                    <p className="font-black text-lg uppercase tracking-tight">
                      {e.player}
                    </p>
                    <p className="text-xs font-bold text-pitch">
                      {e.minute}' • {e.type}
                    </p>
                  </div>
                </motion.div>
              ))}

              {(!match.events || match.events.length === 0) && (
                <p className="text-sm italic text-slate-500 py-6 text-center">
                  No major incidents logged yet.
                </p>
              )}
            </div>

            {/* Match Report */}
            {match.report && (
              <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2rem] space-y-3">
                <h3 className="font-black uppercase text-xs tracking-widest text-pitch">
                  Tactical Summary
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line font-medium italic">
                  "{match.report}"
                </p>
              </div>
            )}
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

            {/* MVP Award */}
            {match.mvpAward && (
              <div className="bg-amber-500/5 border-2 border-amber-500/20 rounded-[2.5rem] p-8 space-y-6">
                <h3 className="font-black text-[10px] uppercase tracking-[0.4em] text-amber-500 flex items-center gap-2">
                  <Trophy className="h-4 w-4" /> Man of the Match
                </h3>
                {match.mvpAward.photoUrl && (
                  <img
                    src={match.mvpAward.photoUrl}
                    className="h-48 w-full object-cover rounded-2xl border-2 border-amber-500/30"
                    alt=""
                  />
                )}
                <div>
                  <p className="text-2xl font-black uppercase italic leading-none">
                    {match.mvpAward.player?.name}
                  </p>
                  <p className="text-sm italic text-slate-400 mt-2">
                    "{match.mvpAward.citation}"
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
