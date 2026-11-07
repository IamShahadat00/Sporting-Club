"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Footprints, Shield, User, Trophy, Filter, Sparkles } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

export default function PlayersPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("All");
  const [teamFilter, setTeamFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/players").then((r) => r.json()).catch(() => []),
      fetch("/api/teams").then((r) => r.json()).catch(() => []),
    ]).then(([playersData, teamsData]) => {
      setPlayers(Array.isArray(playersData) ? playersData : []);
      setTeams(Array.isArray(teamsData) ? teamsData : []);
      setLoading(false);
    });
  }, []);

  const filteredPlayers = players.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(filter.toLowerCase());
    const matchesPos = positionFilter === "All" || p.position === positionFilter;
    const matchesTeam =
      teamFilter === "All" ||
      (teamFilter === "free-agent" ? !p.teamId : p.teamId === teamFilter);

    return matchesSearch && matchesPos && matchesTeam;
  });

  return (
    <div className="min-h-screen bg-background text-foreground pb-28">
      {/* HEADER SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-8 space-y-6">
        <BackButton fallbackHref="/" forceHref="/" label="Return to Arena" />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-border pb-6">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-pitch flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Official Roster Directory
            </span>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none text-foreground">
              FOOTBALL <span className="text-pitch">PLAYERS</span>
            </h1>
          </div>

          {/* DYNAMIC SEARCH & TEAM / POSITION FILTERS */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3 bg-card p-3 sm:p-4 rounded-2xl border border-border shadow-sm">
            {/* Search Input */}
            <div className="relative flex-1 sm:min-w-[220px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search athlete..."
                className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-xs font-bold uppercase outline-none focus:border-pitch transition-all text-foreground placeholder:text-muted-foreground"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>

            {/* TEAM FILTER DROPDOWN */}
            <div className="relative sm:min-w-[180px]">
              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:border-pitch outline-none cursor-pointer"
              >
                <option value="All">All Teams ({teams.length})</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
                <option value="free-agent">Free Agents / Unassigned</option>
              </select>
            </div>

            {/* Position Pills */}
            <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
              {["All", "Forward", "Midfielder", "Defender", "Goalkeeper"].map((pos) => (
                <button
                  key={pos}
                  onClick={() => setPositionFilter(pos)}
                  className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap border ${
                    positionFilter === pos
                      ? "bg-pitch text-white border-pitch shadow-sm"
                      : "bg-muted/50 text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  {pos === "All" ? "All Pos" : pos}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MODERN SPORTS GENERATIVE CARD GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        <AnimatePresence mode="popLayout">
          {filteredPlayers.map((player, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.45, delay: Math.min(idx * 0.03, 0.3) }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              key={player.id}
              className="group relative bg-card rounded-[2.2rem] border-2 border-border hover:border-pitch/60 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-pitch/10 transition-all duration-300 flex flex-col justify-between"
            >
              {/* TOP HEADER: TEAM CREST FRAME */}
              <div className="p-5 pb-0 flex items-center justify-between gap-3 z-10 relative">
                {/* Team Crest Frame Badge */}
                {player.team ? (
                  <div className="inline-flex items-center gap-2 bg-background/90 backdrop-blur-md border border-pitch/30 py-1 px-3 rounded-full shadow-sm">
                    {player.team.logoUrl ? (
                      <img
                        src={player.team.logoUrl}
                        alt=""
                        className="h-5 w-5 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <span className="h-5 w-5 rounded-full bg-pitch text-white text-[9px] font-black flex items-center justify-center">
                        {player.team.name[0]}
                      </span>
                    )}
                    <span className="text-[10px] font-black uppercase tracking-wider text-foreground truncate max-w-[130px]">
                      {player.team.name}
                    </span>
                  </div>
                ) : (
                  <span className="text-[9px] font-bold uppercase tracking-widest bg-muted text-muted-foreground px-3 py-1 rounded-full border border-border">
                    Free Agent
                  </span>
                )}

                {/* Jersey Badge */}
                <div className="h-8 w-8 rounded-full bg-pitch/10 text-pitch border border-pitch/30 flex items-center justify-center font-black text-xs shrink-0">
                  #{player.jerseyNumber ?? "-"}
                </div>
              </div>

              {/* CENTER: ATHLETE PORTRAIT WITH SPORTS GLOW & WATERMARK */}
              <div className="relative h-64 sm:h-72 w-full flex items-center justify-center overflow-hidden my-2">
                {/* Giant Jersey Number Watermark */}
                <span className="absolute -bottom-6 -right-2 text-[9rem] font-black italic text-foreground/[0.04] group-hover:text-pitch/[0.08] select-none transition-colors duration-500 leading-none">
                  {player.jerseyNumber ?? ""}
                </span>

                {/* Player Photo with Glow Ring */}
                <div className="relative z-10 h-44 w-44 sm:h-48 sm:w-48 rounded-full p-1 border-2 border-dashed border-pitch/30 group-hover:border-pitch group-hover:rotate-3 transition-all duration-500 shadow-xl">
                  <div className="h-full w-full rounded-full overflow-hidden bg-muted">
                    {player.photoUrl && player.photoUrl.trim() !== "" ? (
                      <img
                        src={player.photoUrl}
                        alt={player.name}
                        className="h-full w-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground/30">
                        <User className="h-20 w-20" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Position Chip */}
                <div className="absolute bottom-2 left-6 z-10 bg-pitch text-white font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                  {player.position || "Player"}
                </div>
              </div>

              {/* BOTTOM: ATHLETE DOSSIER */}
              <div className="p-5 pt-2 space-y-3 border-t border-border bg-muted/20">
                <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tight text-foreground group-hover:text-pitch transition-colors truncate">
                    {player.name}
                  </h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                    Verified BADC Athlete
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-background/80 p-2 rounded-xl border border-border flex items-center gap-2">
                    <Footprints className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <div className="truncate">
                      <span className="text-[8px] font-bold text-muted-foreground block uppercase">Foot</span>
                      <span className="font-bold text-[11px] text-foreground">{player.strongFoot || "Right"}</span>
                    </div>
                  </div>

                  <div className="bg-background/80 p-2 rounded-xl border border-border flex items-center gap-2">
                    <Trophy className="h-3.5 w-3.5 text-pitch shrink-0" />
                    <div className="truncate">
                      <span className="text-[8px] font-bold text-muted-foreground block uppercase">Goals</span>
                      <span className="font-black text-[11px] text-pitch">{player.goals ?? 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="col-span-full py-24 text-center">
            <p className="font-black uppercase tracking-widest text-pitch text-xs animate-pulse">
              Loading Athletes...
            </p>
          </div>
        )}

        {!loading && filteredPlayers.length === 0 && (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-border rounded-3xl">
            <User className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="font-black uppercase tracking-widest text-muted-foreground text-xs">
              No athletes found matching these filters.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}