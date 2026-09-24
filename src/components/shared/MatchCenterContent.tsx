"use client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Trophy,
  Plus,
  Info,
  Clock,
  ChevronRight,
} from "lucide-react";
import { getAutomatedStatus, formatMatchTime } from "@/lib/utils";

export function MatchCenterContent({
  today,
  upcoming,
  past,
  isAdmin,
  onDelete,
  onCreate,
}: any) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <h1 className="text-4xl font-black tracking-tight uppercase italic">
            Match Center
          </h1>
          {isAdmin && (
            <Button
              onClick={onCreate}
              className="bg-pitch hover:bg-pitch-dark text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-pitch/20"
            >
              <Plus className="mr-2 h-4 w-4" /> Schedule Match
            </Button>
          )}
        </div>
        <div className="h-1 w-20 bg-pitch rounded-full" />
      </div>

      {/* TODAY SECTION */}
      <section className="space-y-6">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-pitch animate-pulse" />{" "}
          Today&apos;s Schedule
        </h2>

        <div className="grid gap-6">
          {today.length > 0 ? (
            today.map((m: any) => (
              <FeaturedMatchCard
                key={m.id}
                match={{ ...m, status: getAutomatedStatus(m) }}
                isAdmin={isAdmin}
                onDelete={onDelete}
              />
            ))
          ) : (
            <div className="py-16 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center bg-muted/30 text-muted-foreground">
              <Calendar className="h-10 w-10 mb-3 opacity-20" />
              <p className="font-bold italic">No matches scheduled for today</p>
            </div>
          )}
        </div>
      </section>

      {/* GRID FOR OTHERS */}
      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <h3 className="font-black uppercase text-xs tracking-widest flex items-center gap-2 text-sky-500">
            <Clock className="h-4 w-4" /> Upcoming Fixtures
          </h3>
          <div className="space-y-3">
            {upcoming.map((m: any) => (
              <CompactMatchRow key={m.id} match={m} isAdmin={isAdmin} />
            ))}
            {upcoming.length === 0 && (
              <p className="text-sm text-muted-foreground italic pl-2">
                No upcoming fixtures.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="font-black uppercase text-xs tracking-widest flex items-center gap-2 text-gold">
            <Trophy className="h-4 w-4" /> Recent Results
          </h3>
          <div className="space-y-3">
            {past.map((m: any) => (
              <CompactMatchRow key={m.id} match={m} isAdmin={isAdmin} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturedMatchCard({ match, isAdmin, onDelete }: any) {
  const isLive = match.status === "LIVE";

  return (
    <Link
      href={
        isAdmin ? `/admin/matches/${match.id}` : `/match-center/${match.id}`
      }
      className="group block"
    >
      <div
        className={`relative border-2 rounded-[2.5rem] p-8 md:p-12 transition-all bg-card hover:shadow-2xl overflow-hidden ${isLive ? "border-pitch ring-4 ring-pitch/10" : "hover:border-pitch"}`}
      >
        {isLive && (
          <Badge className="absolute top-0 right-0 rounded-none rounded-bl-2xl px-6 py-2 bg-pitch text-white font-black animate-pulse">
            LIVE NOW
          </Badge>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8">
          {/* Home */}
          <div className="flex items-center gap-6 justify-center md:justify-start">
            <TeamLogo url={match.homeTeam.logoUrl} name={match.homeTeam.name} />
            <h3 className="text-2xl font-black uppercase truncate">
              {match.homeTeam.name}
            </h3>
          </div>

          {/* Score */}
          <div className="text-center space-y-2">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Match #{match.matchNumber}
            </p>
            <div className="text-6xl font-black tabular-nums tracking-tighter flex items-center justify-center gap-4">
              <span>{match.homeScore}</span>
              <span className="text-muted-foreground/20">-</span>
              <span>{match.awayScore}</span>
            </div>
            <Badge
              variant="secondary"
              className="font-black uppercase text-[10px] tracking-widest"
            >
              {match.status}
            </Badge>
          </div>

          {/* Away */}
          <div className="flex flex-row-reverse items-center gap-6 justify-center md:justify-start">
            <TeamLogo url={match.awayTeam.logoUrl} name={match.awayTeam.name} />
            <h3 className="text-2xl font-black uppercase truncate text-right">
              {match.awayTeam.name}
            </h3>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t flex justify-between items-center text-[10px] font-black uppercase text-muted-foreground tracking-widest">
          <span>
            {match.venue} ·{" "}
            {new Date(match.scheduledStart).toLocaleDateString()} ·{" "}
            {formatMatchTime(match.scheduledStart)}
          </span>
          <span className="text-pitch group-hover:translate-x-1 transition-transform flex items-center gap-1">
            Match Report <ChevronRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function CompactMatchRow({ match }: any) {
  return (
    <Link
      href={`/match-center/${match.id}`}
      className="flex items-center justify-between p-5 rounded-2xl border bg-card hover:border-pitch transition-all group shadow-sm"
    >
      <div className="flex items-center gap-4">
        <div className="flex -space-x-2">
          <img
            src={match.homeTeam.logoUrl}
            className="h-8 w-8 rounded-full border bg-white"
            alt=""
          />
          <img
            src={match.awayTeam.logoUrl}
            className="h-8 w-8 rounded-full border bg-white"
            alt=""
          />
        </div>
        <span className="text-sm font-bold uppercase truncate max-w-[120px] md:max-w-none">
          {match.homeTeam.name} v {match.awayTeam.name}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-black text-lg">
          {match.homeScore}-{match.awayScore}
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-pitch" />
      </div>
    </Link>
  );
}

function TeamLogo({ url, name }: any) {
  return url && url.trim() !== "" ? (
    <img
      src={url}
      className="h-20 w-20 rounded-full object-cover border-4 bg-white shadow-md"
      alt={name}
    />
  ) : (
    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center font-black text-2xl text-muted-foreground border-4">
      {name[0]}
    </div>
  );
}
