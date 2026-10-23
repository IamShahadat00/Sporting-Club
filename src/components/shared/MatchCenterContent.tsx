"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Trophy,
  Plus,
  Clock,
  ChevronRight,
  MapPin,
  Flame,
  Radio,
  CheckCircle2,
  CalendarDays,
  Shield,
  Trash2,
} from "lucide-react";
import { getAutomatedStatus, formatMatchTime } from "@/lib/utils";

export function formatMatchUrl(match: any, isAdmin = false) {
  const matchNum = String(match.matchNumber || 1).padStart(2, "0");
  const slug = `match-${matchNum}`;
  return isAdmin ? `/admin/matches/${match.id}` : `/match-center/${slug}`;
}

export function MatchCenterContent({
  today = [],
  upcoming = [],
  past = [],
  isAdmin = false,
  onDelete,
  onCreate,
}: {
  today: any[];
  upcoming: any[];
  past: any[];
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  onCreate?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<
    "ALL" | "TODAY" | "UPCOMING" | "RESULTS"
  >("ALL");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-14 space-y-10 text-white">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-pitch animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-pitch">
              Live Arena Center
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter uppercase italic text-white">
            Match <span className="text-pitch">Center</span>
          </h1>
        </div>

        {isAdmin && (
          <Button
            onClick={onCreate}
            className="bg-pitch hover:bg-pitch-dark text-black rounded-xl h-11 px-6 font-black uppercase text-xs tracking-wider shadow-lg shadow-pitch/20"
          >
            <Plus className="mr-2 h-4 w-4" /> Schedule Fixture
          </Button>
        )}
      </div>

      {/* Filter Tabs (Sofascore Style) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {[
          {
            key: "ALL",
            label: `All Matches (${today.length + upcoming.length + past.length})`,
          },
          {
            key: "TODAY",
            label: `Today's Fixtures (${today.length})`,
            icon: <Radio className="h-3.5 w-3.5 text-pitch" />,
          },
          {
            key: "UPCOMING",
            label: `Upcoming (${upcoming.length})`,
            icon: <Clock className="h-3.5 w-3.5 text-sky-400" />,
          },
          {
            key: "RESULTS",
            label: `Recent Results (${past.length})`,
            icon: <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap border ${
              activeTab === tab.key
                ? "bg-pitch text-black border-pitch shadow-md shadow-pitch/10"
                : "bg-slate-900/80 text-slate-400 border-white/10 hover:border-white/20 hover:text-white"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* SECTION 1: TODAY'S MATCHES (FEATURED) */}
      {(activeTab === "ALL" || activeTab === "TODAY") && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-pitch">
            <Flame className="h-4 w-4" /> Today&apos;s Match Day
          </div>

          <div className="space-y-4">
            {today.length > 0 ? (
              today.map((m: any) => (
                <FotMobMatchCard
                  key={m.id}
                  match={{ ...m, status: getAutomatedStatus(m) }}
                  isAdmin={isAdmin}
                  onDelete={onDelete}
                />
              ))
            ) : (
              <div className="py-12 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center bg-slate-900/30 text-slate-400">
                <Calendar className="h-8 w-8 mb-2 opacity-30 text-pitch" />
                <p className="font-bold text-xs uppercase tracking-widest text-slate-400">
                  No matches scheduled for today
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* SECTION 2: UPCOMING FIXTURES */}
      {(activeTab === "ALL" || activeTab === "UPCOMING") && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-sky-400">
            <Clock className="h-4 w-4" /> Upcoming Fixtures
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {upcoming.map((m: any) => (
              <DetailedFixtureCard
                key={m.id}
                match={m}
                isAdmin={isAdmin}
                onDelete={onDelete}
              />
            ))}
            {upcoming.length === 0 && (
              <div className="col-span-full py-10 border border-dashed border-white/10 rounded-2xl text-center text-xs text-slate-500 uppercase tracking-widest">
                No upcoming fixtures scheduled at this time.
              </div>
            )}
          </div>
        </section>
      )}

      {/* SECTION 3: RECENT RESULTS */}
      {(activeTab === "ALL" || activeTab === "RESULTS") && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-amber-400">
            <Trophy className="h-4 w-4" /> Recent Results & Reports
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {past.map((m: any) => (
              <DetailedResultCard
                key={m.id}
                match={m}
                isAdmin={isAdmin}
                onDelete={onDelete}
              />
            ))}
            {past.length === 0 && (
              <div className="col-span-full py-10 border border-dashed border-white/10 rounded-2xl text-center text-xs text-slate-500 uppercase tracking-widest">
                No past match results recorded yet.
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * FotMob-Style High-Impact Card for LIVE / Today's Matches
 */
function FotMobMatchCard({ match, isAdmin, onDelete }: any) {
  const isLive = match.status === "LIVE";
  const isFinished = match.status === "FINISHED";

  return (
    <div className="relative rounded-[2rem] border-2 border-white/10 hover:border-pitch/50 bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-8 transition-all shadow-2xl group overflow-hidden">
      {/* Top Meta Header: Match No, Season, Date, Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-2.5">
          <span className="bg-white/10 text-white font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-full">
            Match #{String(match.matchNumber || "01").padStart(2, "0")}
          </span>
          <span className="text-xs font-bold text-slate-400">
            {match.season?.name || "Official League"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isLive ? (
            <Badge className="bg-danger text-white font-black text-[10px] tracking-widest uppercase px-3 py-1 animate-pulse border-none">
              ● LIVE NOW
            </Badge>
          ) : isFinished ? (
            <Badge className="bg-slate-800 text-slate-300 font-black text-[10px] tracking-widest uppercase px-3 py-1 border-white/10">
              Full Time
            </Badge>
          ) : (
            <Badge className="bg-sky-500/10 text-sky-400 border border-sky-500/20 font-black text-[10px] tracking-widest uppercase px-3 py-1">
              Scheduled
            </Badge>
          )}

          {isAdmin && onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onDelete(match.id);
              }}
              className="text-red-400 hover:text-red-300 p-1"
              title="Delete Match"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Scoreboard Layout */}
      <Link
        href={
          isAdmin ? `/admin/matches/${match.id}` : `/match-center/${match.id}`
        }
        className="block"
      >
        <Link href={formatMatchUrl(match, isAdmin)} className="block"></Link>
        <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-6 py-2">
          {/* Home Team */}
          <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-4">
            <span className="font-black text-xl sm:text-2xl uppercase tracking-tight text-white group-hover:text-pitch transition-colors text-left md:text-right truncate">
              {match.homeTeam?.name || "TBD"}
            </span>
            <TeamCrest
              url={match.homeTeam?.logoUrl}
              name={match.homeTeam?.name}
            />
          </div>

          {/* Score / Status Center */}
          <div className="md:col-span-1 flex flex-col items-center justify-center py-2 px-4 rounded-2xl bg-white/5 border border-white/10">
            {isFinished || isLive ? (
              <div className="text-3xl sm:text-4xl font-black tabular-nums tracking-tight text-white flex items-center gap-2">
                <span>{match.homeScore ?? 0}</span>
                <span className="text-slate-600">-</span>
                <span>{match.awayScore ?? 0}</span>
              </div>
            ) : (
              <div className="text-center">
                <span className="text-sm font-black text-pitch">VS</span>
                <span className="block text-[10px] text-slate-400 font-bold tracking-wider">
                  {formatMatchTime(match.scheduledStart)}
                </span>
              </div>
            )}
            {match.isPenalty && (
              <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest mt-1">
                ({match.homePens} - {match.awayPens} Pen)
              </span>
            )}
          </div>

          {/* Away Team */}
          <div className="md:col-span-3 flex items-center justify-between md:justify-start gap-4 flex-row-reverse md:flex-row">
            <span className="font-black text-xl sm:text-2xl uppercase tracking-tight text-white group-hover:text-pitch transition-colors truncate">
              {match.awayTeam?.name || "TBD"}
            </span>
            <TeamCrest
              url={match.awayTeam?.logoUrl}
              name={match.awayTeam?.name}
            />
          </div>
        </div>

        {/* Bottom Timeline & Details */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap justify-between items-center text-xs font-bold text-slate-400 gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-pitch" />
              {new Date(match.scheduledStart).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-pitch" />
              {match.venue || "BADC Arena"}
            </span>
          </div>

          <span className="text-pitch flex items-center gap-1 text-[11px] font-black uppercase tracking-wider group-hover:translate-x-1 transition-transform">
            View Match Center <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </Link>
    </div>
  );
}

/**
 * Detailed Fixture Card (For Upcoming Matches)
 */
function DetailedFixtureCard({ match, isAdmin, onDelete }: any) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 hover:border-sky-400/50 transition-all group shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-white/5 pb-2">
          <span className="bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded">
            Match #{String(match.matchNumber || "0").padStart(2, "0")}
          </span>
          <span className="text-slate-400">
            {new Date(match.scheduledStart).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}{" "}
            • {formatMatchTime(match.scheduledStart)}
          </span>
        </div>

        <Link
          href={
            isAdmin ? `/admin/matches/${match.id}` : `/match-center/${match.id}`
          }
          className="space-y-3 block"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TeamCrest
                url={match.homeTeam?.logoUrl}
                name={match.homeTeam?.name}
                size="sm"
              />
              <span className="font-black text-sm uppercase text-white truncate max-w-[150px] sm:max-w-none">
                {match.homeTeam?.name}
              </span>
            </div>
            <span className="text-xs font-black text-slate-500 uppercase">
              Home
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TeamCrest
                url={match.awayTeam?.logoUrl}
                name={match.awayTeam?.name}
                size="sm"
              />
              <span className="font-black text-sm uppercase text-white truncate max-w-[150px] sm:max-w-none">
                {match.awayTeam?.name}
              </span>
            </div>
            <span className="text-xs font-black text-slate-500 uppercase">
              Away
            </span>
          </div>
        </Link>
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-slate-400">
        <span className="truncate flex items-center gap-1">
          <MapPin className="h-3 w-3 text-pitch" />{" "}
          {match.venue || "BADC Arena"}
        </span>
        {isAdmin && onDelete && (
          <button
            onClick={() => onDelete(match.id)}
            className="text-red-400 hover:text-red-300"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Detailed Result Card (For Completed Matches)
 */
function DetailedResultCard({ match, isAdmin, onDelete }: any) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 hover:border-amber-400/50 transition-all group shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-white/5 pb-2">
          <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded">
            Match #{String(match.matchNumber || "0").padStart(2, "0")} • FT
          </span>
          <span>
            {new Date(match.scheduledStart).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        <Link
          href={
            isAdmin ? `/admin/matches/${match.id}` : `/match-center/${match.id}`
          }
          className="space-y-3 block"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TeamCrest
                url={match.homeTeam?.logoUrl}
                name={match.homeTeam?.name}
                size="sm"
              />
              <span className="font-black text-sm uppercase text-white truncate max-w-[150px] sm:max-w-none">
                {match.homeTeam?.name}
              </span>
            </div>
            <span className="font-black text-base tabular-nums text-white">
              {match.homeScore ?? 0}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TeamCrest
                url={match.awayTeam?.logoUrl}
                name={match.awayTeam?.name}
                size="sm"
              />
              <span className="font-black text-sm uppercase text-white truncate max-w-[150px] sm:max-w-none">
                {match.awayTeam?.name}
              </span>
            </div>
            <span className="font-black text-base tabular-nums text-white">
              {match.awayScore ?? 0}
            </span>
          </div>
        </Link>
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-slate-400">
        <span>
          {match.isPenalty
            ? `Pen: ${match.homePens} - ${match.awayPens}`
            : match.venue || "BADC Arena"}
        </span>
        <Link
          href={`/match-center/${match.id}`}
          className="text-amber-400 hover:text-amber-300 uppercase tracking-widest font-black flex items-center gap-1"
        >
          Recap <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

function TeamCrest({
  url,
  name,
  size = "md",
}: {
  url?: string;
  name?: string;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-8 w-8" : "h-14 w-14 sm:h-16 sm:w-16";
  const fontSize = size === "sm" ? "text-xs" : "text-xl";

  return url && url.trim() !== "" ? (
    <img
      src={url}
      className={`${dim} rounded-full object-cover border-2 border-white/20 bg-white p-0.5 shadow-md shrink-0`}
      alt={name || "Team crest"}
    />
  ) : (
    <div
      className={`${dim} rounded-full bg-slate-800 border-2 border-white/10 flex items-center justify-center font-black ${fontSize} text-slate-400 shrink-0`}
    >
      {name?.[0] || "?"}
    </div>
  );
}
