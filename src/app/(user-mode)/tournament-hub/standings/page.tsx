"use client";

import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

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
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-pitch-dark">League Standings</h1>
        
        <div className="flex items-center gap-2 bg-muted p-1 rounded-xl">
          <span className="text-[10px] font-black px-2 uppercase text-muted-foreground">Select Season:</span>
          <select
            className="bg-background border-none rounded-lg px-4 py-1.5 text-sm font-black focus:ring-2 ring-pitch outline-none cursor-pointer"
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
          >
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-2 rounded-[2.5rem] overflow-hidden bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-b-2">
              <TableHead className="w-16 text-center font-bold">POS</TableHead>
              <TableHead className="font-bold">TEAM</TableHead>
              <TableHead className="text-center font-bold">P</TableHead>
              <TableHead className="text-center font-bold text-pitch-dark">W</TableHead>
              <TableHead className="text-center font-bold">D</TableHead>
              <TableHead className="text-center font-bold text-danger">L</TableHead>
              <TableHead className="text-center font-bold">GF</TableHead>
              <TableHead className="text-center font-bold">GD</TableHead>
              <TableHead className="text-center font-black text-2xl">PTS</TableHead>
              <TableHead className="text-center font-bold">FORM (LAST 5)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.map((s, i) => (
              <TableRow key={s.id} className="group transition-colors border-b">
                <TableCell className="text-center font-black text-muted-foreground">{i + 1}</TableCell>
                <TableCell className="font-bold flex items-center gap-4 py-5">
                  {s.team.logoUrl ? (
                    <img src={s.team.logoUrl} className="h-10 w-10 rounded-full border-2 bg-white object-cover shadow-sm" alt="" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-black text-xs">{s.team.name[0]}</div>
                  )}
                  <span className="uppercase tracking-tight text-base">{s.team.name}</span>
                </TableCell>
                <TableCell className="text-center font-medium">{s.played}</TableCell>
                <TableCell className="text-center font-bold text-pitch">{s.won}</TableCell>
                <TableCell className="text-center">{s.drawn}</TableCell>
                <TableCell className="text-center text-danger/60">{s.lost}</TableCell>
                <TableCell className="text-center font-medium">{s.goalsFor || 0}</TableCell>
                <TableCell className={`text-center font-bold ${s.goalDiff > 0 ? 'text-pitch' : s.goalDiff < 0 ? 'text-danger' : ''}`}>
                  {s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}
                </TableCell>
                <TableCell className="text-center font-black text-2xl bg-muted/10 group-hover:bg-pitch-light/20 transition-colors">
                  {s.points}
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-1.5">
                    {s.form?.map((res: string, idx: number) => (
                      <div
                        key={idx}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-md border-2 border-white
                          ${res === 'W' ? 'bg-pitch' : res === 'L' ? 'bg-danger' : 'bg-slate-400'}`}
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

        {loading && <div className="py-20 text-center font-bold animate-pulse">Loading standings...</div>}
        {!loading && standings.length === 0 && (
          <div className="py-20 text-center text-muted-foreground italic">No data available for this season.</div>
        )}
      </div>
    </div>
  );
}