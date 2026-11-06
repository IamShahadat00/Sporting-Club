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
  Pencil,
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
  onEdit,
  onCreate,
}: {
  today: any[];
  upcoming: any[];
  past: any[];
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (match: any) => void;
  onCreate?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<
    "ALL" | "TODAY" | "UPCOMING" | "RESULTS"
  >("ALL");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-14 space-y-10 text-foreground">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-pitch animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-pitch">
              Live Arena Center
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter uppercase italic text-foreground">
            Match <span className="text-pitch">Center</span>
          </h1>
        </div>

        {isAdmin && (
          <Button
            onClick={onCreate}
            className="bg-pitch hover:bg-pitch-dark text-white rounded-xl h-11 px-6 font-black uppercase text-xs tracking-wider shadow-lg shadow-pitch/20"
          >
            <Plus className="mr-2 h-4 w-4" /> Schedule Fixture
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
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
                ? "bg-pitch text-white border-pitch shadow-md shadow-pitch/10"
                : "bg-card text-muted-foreground border-border hover:border-pitch/40 hover:text-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* TODAY'S MATCHES */}
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
                  onEdit={onEdit}
                />
              ))
            ) : (
              <div className="py-12 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center bg-muted/20 text-muted-foreground">
                <Calendar className="h-8 w-8 mb-2 opacity-30 text-pitch" />
                <p className="font-bold text-xs uppercase tracking-widest">
                  No matches scheduled for today
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* UPCOMING FIXTURES */}
      {(activeTab === "ALL" || activeTab === "UPCOMING") && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-sky-500">
            <Clock className="h-4 w-4" /> Upcoming Fixtures
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {upcoming.map((m: any) => (
              <DetailedFixtureCard
                key={m.id}
                match={m}
                isAdmin={isAdmin}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
            {upcoming.length === 0 && (
              <div className="col-span-full py-10 border border-dashed border-border rounded-2xl text-center text-xs text-muted-foreground uppercase tracking-widest">
                No upcoming fixtures scheduled at this time.
              </div>
            )}
          </div>
        </section>
      )}

      {/* RECENT RESULTS */}
      {(activeTab === "ALL" || activeTab === "RESULTS") && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-amber-500">
            <Trophy className="h-4 w-4" /> Recent Results & Reports
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {past.map((m: any) => (
              <DetailedResultCard
                key={m.id}
                match={m}
                isAdmin={isAdmin}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
            {past.length === 0 && (
              <div className="col-span-full py-10 border border-dashed border-border rounded-2xl text-center text-xs text-muted-foreground uppercase tracking-widest">
                No past match results recorded yet.
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function FotMobMatchCard({ match, isAdmin, onDelete, onEdit }: any) {
  const isLive = match.status === "LIVE";
  const isFinished = match.status === "FINISHED";

  return (
    <div className="relative rounded-[2rem] border-2 border-border hover:border-pitch/50 bg-card p-6 sm:p-8 transition-all shadow-xl group overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 mb-6">
        <div className="flex items-center gap-2.5">
          <span className="bg-muted text-foreground font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border border-border">
            Match #{String(match.matchNumber || "01").padStart(2, "0")}
          </span>
          <span className="text-xs font-bold text-muted-foreground">
            {match.season?.name || "Official League"}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {isLive ? (
            <Badge className="bg-danger text-white font-black text-[10px] tracking-widest uppercase px-3 py-1 animate-pulse border-none">
              ● LIVE NOW
            </Badge>
          ) : isFinished ? (
            <Badge
              variant="outline"
              className="font-black text-[10px] tracking-widest uppercase px-3 py-1 border-border"
            >
              Full Time
            </Badge>
          ) : (
            <Badge className="bg-sky-500/10 text-sky-500 border border-sky-500/20 font-black text-[10px] tracking-widest uppercase px-3 py-1">
              Scheduled
            </Badge>
          )}

          {isAdmin && (
            <div className="flex items-center gap-1 ml-2">
              {onEdit && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEdit(match);
                  }}
                  className="text-muted-foreground hover:text-pitch p-1.5 rounded-lg hover:bg-muted"
                  title="Edit Fixture Details"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(match.id);
                  }}
                  className="text-red-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10"
                  title="Delete Match"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <Link href={formatMatchUrl(match, isAdmin)} className="block">
        <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-6 py-2">
          {/* Home Team */}
          <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-4">
            <span className="font-black text-xl sm:text-2xl uppercase tracking-tight text-card-foreground group-hover:text-pitch transition-colors text-left md:text-right truncate">
              {match.homeTeam?.name || "TBD"}
            </span>
            <TeamCrest
              url={match.homeTeam?.logoUrl}
              name={match.homeTeam?.name}
            />
          </div>

          {/* Score / Center */}
          <div className="md:col-span-1 flex flex-col items-center justify-center py-2 px-4 rounded-2xl bg-muted/30 border border-border">
            {isFinished || isLive ? (
              <div className="text-3xl sm:text-4xl font-black tabular-nums tracking-tight text-foreground flex items-center gap-2">
                <span>{match.homeScore ?? 0}</span>
                <span className="text-muted-foreground/40">-</span>
                <span>{match.awayScore ?? 0}</span>
              </div>
            ) : (
              <div className="text-center">
                <span className="text-sm font-black text-pitch">VS</span>
                <span className="block text-[10px] text-muted-foreground font-bold tracking-wider">
                  {formatMatchTime(match.scheduledStart)}
                </span>
              </div>
            )}
            {match.isPenalty && (
              <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest mt-1">
                ({match.homePens} - {match.awayPens} Pen)
              </span>
            )}
          </div>

          {/* Away Team */}
          <div className="md:col-span-3 flex items-center justify-between md:justify-start gap-4 flex-row-reverse md:flex-row">
            <span className="font-black text-xl sm:text-2xl uppercase tracking-tight text-card-foreground group-hover:text-pitch transition-colors truncate">
              {match.awayTeam?.name || "TBD"}
            </span>
            <TeamCrest
              url={match.awayTeam?.logoUrl}
              name={match.awayTeam?.name}
            />
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border flex flex-wrap justify-between items-center text-xs font-bold text-muted-foreground gap-2">
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

function DetailedFixtureCard({ match, isAdmin, onDelete, onEdit }: any) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 hover:border-sky-500/50 transition-all group shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
          <span className="bg-sky-500/10 text-sky-500 px-2 py-0.5 rounded">
            Match #{String(match.matchNumber || "0").padStart(2, "0")}
          </span>
          <div className="flex items-center gap-2">
            <span>
              {new Date(match.scheduledStart).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}{" "}
              • {formatMatchTime(match.scheduledStart)}
            </span>
            {isAdmin && onEdit && (
              <button
                type="button"
                onClick={() => onEdit(match)}
                className="text-muted-foreground hover:text-pitch"
                title="Edit Match"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <Link href={formatMatchUrl(match, isAdmin)} className="space-y-3 block">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TeamCrest
                url={match.homeTeam?.logoUrl}
                name={match.homeTeam?.name}
                size="sm"
              />
              <span className="font-black text-sm uppercase text-card-foreground truncate max-w-[150px] sm:max-w-none">
                {match.homeTeam?.name}
              </span>
            </div>
            <span className="text-xs font-black text-muted-foreground uppercase">
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
              <span className="font-black text-sm uppercase text-card-foreground truncate max-w-[150px] sm:max-w-none">
                {match.awayTeam?.name}
              </span>
            </div>
            <span className="text-xs font-black text-muted-foreground uppercase">
              Away
            </span>
          </div>
        </Link>
      </div>

      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[10px] font-bold text-muted-foreground">
        <span className="truncate flex items-center gap-1">
          <MapPin className="h-3 w-3 text-pitch" />{" "}
          {match.venue || "BADC Arena"}
        </span>
        {isAdmin && onDelete && (
          <button
            onClick={() => onDelete(match.id)}
            className="text-red-500 hover:text-red-400"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

function DetailedResultCard({ match, isAdmin, onDelete, onEdit }: any) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 hover:border-amber-500/50 transition-all group shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
          <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded">
            Match #{String(match.matchNumber || "0").padStart(2, "0")} • FT
          </span>
          <div className="flex items-center gap-2">
            <span>
              {new Date(match.scheduledStart).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
            {isAdmin && onEdit && (
              <button
                type="button"
                onClick={() => onEdit(match)}
                className="text-muted-foreground hover:text-pitch"
                title="Edit Match"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <Link href={formatMatchUrl(match, isAdmin)} className="space-y-3 block">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TeamCrest
                url={match.homeTeam?.logoUrl}
                name={match.homeTeam?.name}
                size="sm"
              />
              <span className="font-black text-sm uppercase text-card-foreground truncate max-w-[150px] sm:max-w-none">
                {match.homeTeam?.name}
              </span>
            </div>
            <span className="font-black text-base tabular-nums text-foreground">
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
              <span className="font-black text-sm uppercase text-card-foreground truncate max-w-[150px] sm:max-w-none">
                {match.awayTeam?.name}
              </span>
            </div>
            <span className="font-black text-base tabular-nums text-foreground">
              {match.awayScore ?? 0}
            </span>
          </div>
        </Link>
      </div>

      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[10px] font-bold text-muted-foreground">
        <span>
          {match.isPenalty
            ? `Pen: ${match.homePens} - ${match.awayPens}`
            : match.venue || "BADC Arena"}
        </span>
        <div className="flex items-center gap-3">
          {isAdmin && onDelete && (
            <button
              onClick={() => onDelete(match.id)}
              className="text-red-500 hover:text-red-400"
            >
              Delete
            </button>
          )}
          <Link
            href={formatMatchUrl(match, isAdmin)}
            className="text-amber-500 hover:text-amber-400 uppercase tracking-widest font-black flex items-center gap-1"
          >
            Recap <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
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
      className={`${dim} rounded-full object-cover border-2 border-border bg-white p-0.5 shadow-md shrink-0`}
      alt={name || "Team crest"}
    />
  ) : (
    <div
      className={`${dim} rounded-full bg-muted border-2 border-border flex items-center justify-center font-black ${fontSize} text-muted-foreground shrink-0`}
    >
      {name?.[0] || "?"}
    </div>
  );
}
