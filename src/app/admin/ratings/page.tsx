// src/app/admin/ratings/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Star, Trophy, Search, Shield } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

export default function AdminRatingsPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/ratings")
        .then((r) => r.json())
        .catch(() => []),
      fetch("/api/teams")
        .then((r) => r.json())
        .catch(() => []),
    ]).then(([ratingsData, teamsData]) => {
      setPlayers(Array.isArray(ratingsData) ? ratingsData : []);
      setTeams(Array.isArray(teamsData) ? teamsData : []);
      setLoading(false);
    });
  }, []);

  const filtered = players.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesTeam = teamFilter === "All" || p.teamId === teamFilter;
    return matchesSearch && matchesTeam;
  });

  return (
    <div className="space-y-6 pb-20">
      <BackButton
        fallbackHref="/admin/dashboard"
        forceHref="/admin/dashboard"
        label="Admin Dashboard"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-pitch">
            Analytics & Performance
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground">
            Player Ratings, Goals & MVP Database
          </h1>
          <p className="text-xs text-muted-foreground font-medium">
            Accurate live database of community ratings, verified match goals,
            and Man of the Match awards.
          </p>
        </div>
      </div>

      {/* SEARCH & TEAM FILTERS */}
      <div className="flex flex-col sm:flex-row gap-3 bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative flex-1 sm:min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search player name..."
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-xs font-bold uppercase outline-none focus:border-pitch"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:border-pitch outline-none"
        >
          <option value="All">All Squads ({teams.length})</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* RATINGS & STATS TABLE */}
      <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table className="w-full text-xs sm:text-sm">
            <TableHeader className="bg-muted/40">
              <TableRow className="border-b border-border">
                <TableHead className="w-10 text-center font-black">#</TableHead>
                <TableHead className="font-black">ATHLETE</TableHead>
                <TableHead className="font-black">TEAM SQUAD</TableHead>
                <TableHead className="text-center font-bold">POS</TableHead>
                <TableHead className="text-center font-bold text-amber-500">
                  USER RATING (0-10)
                </TableHead>
                <TableHead className="text-center font-bold">VOTES</TableHead>
                <TableHead className="text-center font-bold text-pitch">
                  GOALS (⚽)
                </TableHead>
                <TableHead className="text-center font-bold text-amber-500">
                  MVPs (🏆)
                </TableHead>
                <TableHead className="text-center font-bold">STATUS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p, i) => (
                <TableRow
                  key={p.id}
                  className="border-b border-border last:border-0 hover:bg-muted/20"
                >
                  <TableCell className="text-center font-black text-muted-foreground">
                    {i + 1}
                  </TableCell>
                  <TableCell className="py-3 font-bold">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full overflow-hidden bg-muted border border-border shrink-0">
                        {p.photoUrl ? (
                          <img
                            src={p.photoUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center font-bold text-xs">
                            {p.name[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold uppercase text-foreground">
                          {p.name}
                        </p>
                        <span className="text-[10px] text-muted-foreground">
                          #{p.jerseyNumber ?? "-"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {p.team ? (
                      <div className="flex items-center gap-2">
                        {p.team.logoUrl && (
                          <img
                            src={p.team.logoUrl}
                            className="h-4 w-4 rounded-full object-cover"
                            alt=""
                          />
                        )}
                        <span className="text-xs font-bold uppercase">
                          {p.team.name}
                        </span>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-[9px]">
                        Free Agent
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center uppercase text-[11px] font-bold text-muted-foreground">
                    {p.position || "Player"}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center gap-1 font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      <Star className="h-3 w-3 fill-current" />{" "}
                      {p.avgRating.toFixed(1)}★
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-medium text-muted-foreground">
                    {p.votesCount}
                  </TableCell>
                  <TableCell className="text-center font-black text-pitch">
                    {p.goals} ⚽
                  </TableCell>
                  <TableCell className="text-center font-black text-amber-500 text-sm">
                    {p.mvpCount} 🏆
                  </TableCell>
                  <TableCell className="text-center">
                    {p.isInjured ? (
                      <Badge
                        variant="outline"
                        className="text-[9px] text-danger border-danger"
                      >
                        🩹 Injured
                      </Badge>
                    ) : (
                      <Badge className="bg-pitch/15 text-pitch border-pitch/30 text-[9px]">
                        Active
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {loading && (
          <div className="py-14 text-center text-xs font-bold animate-pulse text-pitch uppercase tracking-wider">
            Loading Ratings and MVP Records...
          </div>
        )}
      </div>
    </div>
  );
}
