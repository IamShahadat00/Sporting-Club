// src/app/(public)/tournament-hub/standings/page.tsx
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
import { BackButton } from "@/components/ui/back-button";

export default function StandingsPage() {
  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState("");
  const [standings, setStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tournaments")
      .then((r) => r.json())
      .then((data) => {
        setSeasons(data);
        const active = data.find((s: any) => s.status === "ACTIVE");
        if (active) setSelectedSeason(active.id);
        else if (data.length > 0) setSelectedSeason(data[0].id);
      });
  }, []);

  useEffect(() => {
    if (!selectedSeason) return;
    setLoading(true);
    fetch(`/api/standings?seasonId=${selectedSeason}`)
      .then((r) => r.json())
      .then((data) => {
        setStandings(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedSeason]);

  return (
    <div className="max-w-6xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-6">
      <BackButton fallbackHref="/tournament-hub" label="Tournament Hub" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <h1 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tighter text-foreground">
          League <span className="text-pitch">Standings</span>
        </h1>

        <div className="flex items-center gap-2 bg-card border border-border p-1.5 rounded-xl self-start sm:self-auto">
          <span className="text-[10px] font-black uppercase text-muted-foreground px-2">
            Season:
          </span>
          <select
            className="bg-background border-none rounded-lg px-3 py-1 text-xs font-black uppercase text-pitch outline-none cursor-pointer"
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
          >
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table className="w-full text-xs sm:text-sm">
            <TableHeader className="bg-muted/40">
              <TableRow className="border-b border-border">
                <TableHead className="w-10 text-center font-black">#</TableHead>
                <TableHead className="font-black">TEAM</TableHead>
                <TableHead className="text-center font-bold">P</TableHead>
                <TableHead className="text-center font-bold text-pitch">
                  W
                </TableHead>
                <TableHead className="text-center font-bold hidden sm:table-cell">
                  D
                </TableHead>
                <TableHead className="text-center font-bold text-danger hidden sm:table-cell">
                  L
                </TableHead>
                <TableHead className="text-center font-bold hidden md:table-cell">
                  GF
                </TableHead>
                <TableHead className="text-center font-bold hidden md:table-cell">
                  GD
                </TableHead>
                <TableHead className="text-center font-black text-base text-foreground">
                  PTS
                </TableHead>
                <TableHead className="text-center font-bold">FORM</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standings.map((s, i) => (
                <TableRow
                  key={s.id}
                  className="border-b border-border last:border-0 hover:bg-muted/20"
                >
                  <TableCell className="text-center font-black text-muted-foreground">
                    {i + 1}
                  </TableCell>
                  <TableCell className="font-bold py-3.5">
                    <div className="flex items-center gap-2.5">
                      {s.team.logoUrl ? (
                        <img
                          src={s.team.logoUrl}
                          className="h-8 w-8 rounded-full border border-border object-cover bg-background shrink-0"
                          alt=""
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-black text-xs text-muted-foreground shrink-0">
                          {s.team.name[0]}
                        </div>
                      )}
                      <span className="uppercase text-xs sm:text-sm truncate max-w-[130px] sm:max-w-none">
                        {s.team.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {s.played}
                  </TableCell>
                  <TableCell className="text-center font-bold text-pitch">
                    {s.won}
                  </TableCell>
                  <TableCell className="text-center hidden sm:table-cell">
                    {s.drawn}
                  </TableCell>
                  <TableCell className="text-center text-danger/70 hidden sm:table-cell">
                    {s.lost}
                  </TableCell>
                  <TableCell className="text-center hidden md:table-cell">
                    {s.goalsFor || 0}
                  </TableCell>
                  <TableCell className="text-center font-bold hidden md:table-cell">
                    {s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}
                  </TableCell>
                  <TableCell className="text-center font-black text-base bg-muted/10">
                    {s.points}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      {s.form?.map((res: string, idx: number) => (
                        <div
                          key={idx}
                          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[9px] font-black text-white ${
                            res === "W"
                              ? "bg-pitch"
                              : res === "L"
                                ? "bg-danger"
                                : "bg-slate-500"
                          }`}
                        >
                          {res}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {loading && (
          <div className="py-14 text-center text-xs font-bold animate-pulse text-pitch">
            Loading standings...
          </div>
        )}
        {!loading && standings.length === 0 && (
          <div className="py-14 text-center text-muted-foreground text-xs italic">
            No standings data available for this season.
          </div>
        )}
      </div>
    </div>
  );
}
