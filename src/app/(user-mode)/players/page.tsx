"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Footprints, Shield, User, Trophy } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

export default function PlayersPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/players")
      .then((r) => r.json())
      .then((data) => {
        setPlayers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading players:", err);
        setLoading(false);
      });
  }, []);

  const filteredPlayers = players.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(filter.toLowerCase());
    const matchesPos =
      positionFilter === "All" || p.position === positionFilter;
    return matchesSearch && matchesPos;
  });

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* HEADER SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-8 space-y-6">
        <BackButton fallbackHref="/" label="Return to Arena" />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none text-foreground">
              FOOTBALL <span className="text-pitch">PLAYERS</span>
            </h1>
            <p className="text-muted-foreground font-bold uppercase tracking-[0.3em] text-[11px] sm:text-xs">
              Official Athlete Directory & Squad Affiliations
            </p>
          </div>

          {/* SEARCH & FILTERS */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3 bg-card p-3 sm:p-4 rounded-2xl border border-border shadow-sm">
            <div className="relative flex-1 sm:min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search athlete..."
                className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold uppercase outline-none focus:border-pitch transition-all text-foreground placeholder:text-muted-foreground"
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {["All", "Forward", "Midfielder", "Defender", "Goalkeeper"].map(
                (pos) => (
                  <button
                    key={pos}
                    onClick={() => setPositionFilter(pos)}
                    className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap border ${
                      positionFilter === pos
                        ? "bg-pitch text-white border-pitch shadow-sm"
                        : "bg-muted/50 text-muted-foreground border-border hover:text-foreground"
                    }`}
                  >
                    {pos}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PLAYERS GRID WITH TEAM FRAMES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <AnimatePresence mode="popLayout">
          {filteredPlayers.map((player, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, delay: Math.min(idx * 0.04, 0.3) }}
              key={player.id}
              className="group relative bg-card rounded-3xl border border-border overflow-hidden flex flex-col sm:flex-row shadow-md hover:border-pitch/50 transition-all duration-500"
            >
              {/* PHOTO ON LEFT WITH EMBEDDED TEAM FRAME CREST */}
              <div className="w-full sm:w-5/12 h-60 sm:h-full relative overflow-hidden bg-muted border-b sm:border-b-0 sm:border-r border-border shrink-0">
                {player.photoUrl && player.photoUrl.trim() !== "" ? (
                  <img
                    src={player.photoUrl}
                    className="h-full w-full object-cover group-hover:scale-105 transition-all duration-700"
                    alt={player.name}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground/30">
                    <User className="h-20 w-20" />
                  </div>
                )}

                {/* Position Badge */}
                <div className="absolute top-3 left-3 bg-pitch text-white font-black text-[9px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                  {player.position || "Player"}
                </div>

                {/* Team Crest Frame on Image */}
                <div className="absolute bottom-3 right-3 bg-card/90 backdrop-blur-md p-1 rounded-full border-2 border-pitch shadow-lg">
                  {player.team?.logoUrl ? (
                    <img
                      src={player.team.logoUrl}
                      alt={player.team.name}
                      className="h-8 w-8 rounded-full object-cover"
                      title={player.team.name}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-black text-muted-foreground">
                      FA
                    </div>
                  )}
                </div>
              </div>

              {/* DETAILS ON RIGHT */}
              <div className="p-5 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  {/* TEAM FRAME BADGE */}
                  {player.team ? (
                    <div className="inline-flex items-center gap-2 bg-pitch/10 border border-pitch/30 px-3 py-1 rounded-full mb-2">
                      {player.team.logoUrl && (
                        <img
                          src={player.team.logoUrl}
                          className="h-4 w-4 rounded-full object-cover"
                          alt=""
                        />
                      )}
                      <span className="text-[10px] font-black uppercase text-pitch tracking-wider">
                        {player.team.name}
                      </span>
                    </div>
                  ) : (
                    <span className="inline-block bg-muted text-muted-foreground text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-border mb-2">
                      Free Agent / Unassigned
                    </span>
                  )}

                  <h3 className="text-xl sm:text-2xl font-black uppercase italic tracking-tight text-foreground group-hover:text-pitch transition-colors truncate">
                    {player.name}
                  </h3>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">
                    Jersey #
                    {String(player.jerseyNumber || "-").padStart(2, "0")}
                  </p>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-border text-xs">
                  <div className="flex items-center gap-3">
                    <Footprints className="h-4 w-4 text-amber-500 shrink-0" />
                    <div>
                      <span className="text-[9px] font-bold text-muted-foreground block uppercase">
                        Preferred Foot
                      </span>
                      <span className="font-bold text-foreground">
                        {player.strongFoot || "Right"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 text-[10px] font-black uppercase text-pitch">
                  <Trophy className="h-3.5 w-3.5" />
                  <span>Verified BADC Athlete</span>
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
              No athletes found matching criteria.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
