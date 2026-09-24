"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Briefcase, Quote, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DirectorsPage() {
  const [directors, setDirectors] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/directors")
      .then((r) => r.json())
      .then(setDirectors);
  }, []);

  return (
    <div className="bg-[#020617] text-white min-h-screen selection:bg-pitch selection:text-white">
      {/* 1. INTRO HEADER */}
      <section className="relative h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.08),_transparent_70%)]" />
        <Link
          href="/tournament-hub"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-pitch font-black uppercase text-[10px] tracking-[0.4em] mb-12 transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Arena
        </Link>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <Shield className="h-16 w-16 mx-auto text-pitch mb-6 opacity-40" />
          <h1 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter leading-none mb-4">
            The <span className="text-pitch">Board</span>
          </h1>
          <p className="text-slate-400 font-medium uppercase tracking-[0.5em] text-xs">
            Architects of BADC Sporting Excellence
          </p>
        </motion.div>
      </section>

      {/* 2. DYNAMIC SCROLLING CARDS */}
      <div className="pb-40">
        {directors.map((director, index) => (
          <motion.section
            key={director.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className={`min-h-[80vh] flex items-center border-b border-white/5 py-24 ${index % 2 === 0 ? "" : "bg-slate-900/30"}`}
          >
            <div
              className={`max-w-7xl mx-auto px-6 grid md:grid-cols-2 items-center gap-16 w-full ${index % 2 === 0 ? "" : "md:flex-row-reverse"}`}
            >
              {/* IMAGE SIDE */}
              <div
                className={`relative group ${index % 2 === 0 ? "order-1" : "order-1 md:order-2"}`}
              >
                <div className="absolute inset-0 bg-pitch/10 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden border-2 border-white/10 shadow-2xl scale-100 group-hover:scale-[1.02] transition-transform duration-700">
                  {director.photoUrl ? (
                    <img
                      src={director.photoUrl}
                      className="h-full w-full object-cover"
                      alt=""
                    />
                  ) : (
                    <div className="h-full w-full bg-slate-800 flex items-center justify-center font-black text-9xl opacity-10">
                      {director.name[0]}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-80" />
                </div>
              </div>

              {/* TEXT SIDE */}
              <div
                className={`space-y-8 ${index % 2 === 0 ? "order-2" : "order-2 md:order-1"}`}
              >
                <p className="text-pitch font-black uppercase tracking-[0.6em] text-[10px]">
                  {director.designation}
                </p>
                <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.9]">
                  {director.name}
                </h2>

                <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden">
                  <Quote className="absolute top-4 right-4 h-12 w-12 opacity-5 text-white" />
                  <div className="flex items-center gap-3 mb-6 text-amber-500">
                    <Briefcase className="h-4 w-4" />
                    <span className="text-xs font-black uppercase tracking-widest">
                      {director.profession || "Executive Management"}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xl font-medium leading-relaxed italic">
                    "
                    {director.bio ||
                      "Committed to the growth of sporting culture and the development of the next generation of BADC athletes."}
                    "
                  </p>
                </div>
              </div>
            </div>
          </motion.section>
        ))}
      </div>
    </div>
  );
}
