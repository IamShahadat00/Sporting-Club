"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Footprints, 
  Shield, 
  User, 
  ArrowLeft, 
  Trophy, // FIXED: Added missing import
  LayoutGrid,
  Filter
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function PlayersPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("All");

  useEffect(() => {
    fetch("/api/players")
      .then((r) => r.json())
      .then((data) => setPlayers(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error loading players:", err));
  }, []);

  const filteredPlayers = players.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(filter.toLowerCase());
    const matchesPos = positionFilter === "All" || p.position === positionFilter;
    return matchesSearch && matchesPos;
  });

  return (
    <div className="bg-[#020617] text-white min-h-screen selection:bg-pitch selection:text-white pb-40">
      {/* 1. LARGE HEADER SECTION */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-12 space-y-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-pitch font-black uppercase text-[10px] tracking-[0.4em] transition-all group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-2 transition-transform" /> 
          Back to Arena
        </Link>
        
        <div className="flex flex-col lg:flex-row justify-between items-end gap-8">
          <div className="space-y-2">
            <h1 className="text-7xl md:text-[10rem] font-black italic uppercase tracking-tighter leading-[0.8] text-white">
              THE <br />
              <span className="text-pitch drop-shadow-[0_0_30px_rgba(16,185,129,0.2)]">ROSTER</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.5em] text-xs pl-2">Elite Athlete Directory</p>
          </div>

          {/* 2. DYNAMIC INDUSTRIAL FILTERS */}
          <div className="w-full lg:w-auto flex flex-col md:flex-row gap-4 bg-slate-900/50 p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-2xl shadow-2xl">
            <div className="relative flex-1 md:min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search Player Name..."
                className="w-full bg-[#020617] border-none rounded-2xl pl-12 pr-6 py-4 text-sm font-bold uppercase outline-none ring-2 ring-transparent focus:ring-pitch transition-all placeholder:text-slate-700"
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {["All", "Forward", "Midfielder", "Defender", "Goalkeeper"].map((pos) => (
                <button
                  key={pos}
                  onClick={() => setPositionFilter(pos)}
                  className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase transition-all whitespace-nowrap border ${
                    positionFilter === pos
                      ? "bg-pitch text-black border-pitch shadow-lg shadow-pitch/20"
                      : "bg-slate-900 text-slate-500 border-white/5 hover:border-white/20"
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. MASONRY GRID OF LARGE SCALE CARDS */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
        <AnimatePresence mode="popLayout">
          {filteredPlayers.map((player, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6, delay: idx * 0.05 }}
              key={player.id}
              className="group relative h-[500px] bg-gradient-to-br from-slate-900 to-slate-950 rounded-[4rem] border-2 border-white/5 overflow-hidden flex shadow-2xl hover:border-pitch/50 transition-all duration-700"
            >
              {/* LARGE GHOST NUMBER WATERMARK */}
              <span className="absolute right-[-5%] bottom-[-5%] text-[22rem] font-black italic text-white/[0.03] select-none pointer-events-none tracking-tighter leading-none group-hover:text-pitch/[0.05] transition-colors">
                #{player.jerseyNumber}
              </span>

              {/* LEFT SIDE: PLAYER IMAGE */}
              <div className="w-1/2 h-full relative overflow-hidden bg-slate-800 border-r border-white/5">
                {player.photoUrl && player.photoUrl.trim() !== "" ? (
                  <img
                    src={player.photoUrl}
                    className="h-full w-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                    alt={player.name}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-slate-900 opacity-20">
                    <User className="h-32 w-32" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-slate-900" />
                
                {/* POSITION TAB */}
                <div className="absolute top-8 left-0">
                  <div className="bg-pitch text-black font-black text-[9px] uppercase tracking-[0.3em] px-6 py-2 rounded-r-xl shadow-xl transform -skew-x-12 -translate-x-2">
                    {player.position}
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: PLAYER DETAILS */}
              <div className="w-1/2 h-full p-10 flex flex-col justify-center relative z-10 space-y-8">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black uppercase italic leading-[0.9] group-hover:text-pitch transition-colors tracking-tighter mb-2">
                    {player.name}
                  </h2>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
                    Serial Identity #{String(player.jerseyNumber).padStart(2, '0')}
                  </p>
                </div>

                <div className="space-y-4 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-4 group/item">
                    <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center group-hover/item:bg-sky-500/20 transition-colors">
                      <Shield className="h-4 w-4 text-sky-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-600 uppercase">Home District</span>
                      <span className="text-xs font-bold uppercase tracking-tight">{player.district || "Dhaka"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 group/item">
                    <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center group-hover/item:bg-amber-500/20 transition-colors">
                      <Footprints className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-600 uppercase">Dominant Foot</span>
                      <span className="text-xs font-bold uppercase tracking-tight">{player.strongFoot || "Right"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-pitch group-hover:text-black transition-all shadow-lg group-hover:shadow-pitch/20">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Authenticated</span>
                    <span className="text-[9px] font-bold text-pitch uppercase">Official Roster</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredPlayers.length === 0 && (
          <div className="col-span-full py-40 text-center border-2 border-dashed border-white/5 rounded-[4rem] bg-white/[0.01]">
            <User className="h-16 w-16 mx-auto text-slate-800 mb-6 opacity-20" />
            <p className="font-black uppercase tracking-[0.4em] text-slate-600 text-sm">No Athletes matching those parameters</p>
          </div>
        )}
      </section>
    </div>
  );
}