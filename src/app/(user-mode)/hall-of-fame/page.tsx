"use client"; // Changed to client for complex animations

import { useEffect, useState } from "react";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Trophy, Crown, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

// Helper for the Gold-Silver Gradient Text
const metallicText =
  "bg-clip-text text-transparent bg-gradient-to-b from-[#e2e2e2] via-[#d4af37] to-[#8a6d3b]";

export default function HallOfFamePage() {
  const [legends, setLegends] = useState<any[]>([]);

  // Since we need interactivity and complex motion, we fetch the data
  useEffect(() => {
    fetch("/api/hall-of-fame")
      .then((r) => r.json())
      .then((data) => setLegends(data));
  }, []);

  return (
    <div className="bg-[#030303] text-white min-h-screen overflow-x-hidden selection:bg-gold selection:text-black">
      {/* FIXED BACKGROUND AURA */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(212,175,55,0.05),_transparent_70%)]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
      </div>

      {/* HEADER */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-gold font-black uppercase text-[10px] tracking-[0.4em] mb-12 transition-all group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-2 transition-transform" />
            Return to Club
          </Link>
        </motion.div>

        <div className="flex flex-col md:flex-row items-end justify-between border-b border-white/10 pb-12 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <span className="text-gold font-black uppercase tracking-[0.5em] text-sm mb-4 block flex items-center gap-2">
              <Crown className="h-4 w-4" /> BADC Sporting Club
            </span>
            <h1
              className={`text-7xl md:text-[10rem] font-black uppercase italic leading-[0.8] tracking-tighter ${metallicText}`}
            >
              Hall of <br /> <span className="opacity-50">Fame</span>
            </h1>
          </motion.div>
          <motion.div
            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="hidden md:block"
          >
            <Trophy className="h-32 w-32 text-[#d4af37] opacity-40 filter blur-[1px]" />
          </motion.div>
        </div>
      </div>

      {/* LEGENDS LIST */}
      <div className="relative z-10 pb-60">
        {legends.map((legend, index) => (
          <LegendSection key={legend.id} legend={legend} index={index} />
        ))}

        {legends.length === 0 && (
          <div className="text-center py-60">
            <Trophy className="h-20 w-20 mx-auto text-zinc-800 mb-6 animate-pulse" />
            <p className="text-zinc-600 font-black uppercase tracking-[0.5em] text-xs">
              The Wall is waiting for greatness.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function LegendSection({ legend, index }: { legend: any; index: number }) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      className="relative min-h-screen flex items-center border-b border-white/5 overflow-hidden group py-24"
    >
      {/* DYNAMIC AURA BEHIND PLAYER */}
      <div className="absolute right-[10%] top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#d4af37] opacity-[0.03] blur-[120px] rounded-full group-hover:opacity-[0.07] transition-opacity duration-1000" />

      {/* BACKGROUND SERIAL NUMBER */}
      <motion.span
        initial={{ x: -100, opacity: 0 }}
        whileInView={{ x: 0, opacity: 0.05 }}
        transition={{ duration: 1.5 }}
        className="absolute left-10 top-1/2 -translate-y-1/2 text-[30rem] font-black italic select-none pointer-events-none text-silver"
      >
        {String(index + 1).padStart(2, "0")}
      </motion.span>

      <div className="max-w-7xl mx-auto px-6 w-full grid md:grid-cols-2 items-center gap-12 relative z-10">
        {/* TEXT CONTENT */}
        <div className="order-2 md:order-1">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <p className="text-gold font-black uppercase tracking-[0.6em] mb-4 text-xs flex items-center gap-2">
              <Sparkles className="h-3 w-3" /> Class of {legend.year}
            </p>
            <h2
              className={`text-6xl md:text-[7rem] font-black uppercase italic leading-[0.9] mb-8 tracking-tighter group-hover:scale-[1.02] transition-transform duration-700`}
            >
              {legend.name}
            </h2>

            <div className="space-y-8">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gold blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative px-8 py-3 bg-gradient-to-r from-[#d4af37] to-[#f2d06b] text-black font-black uppercase italic text-xl transform -skew-x-12 shadow-[5px_5px_0px_0px_rgba(255,255,255,0.2)]">
                  {legend.title}
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gold via-silver to-transparent" />
                <p className="text-zinc-400 text-lg md:text-2xl font-light leading-relaxed max-w-xl italic pl-8">
                  {legend.description ||
                    "A cornerstone of BADC legacy, whose spirit and skill on the pitch defined an era for our sporting club."}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* IMAGE SECTION */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="order-1 md:order-2 relative"
        >
          <div className="relative aspect-[4/5] w-full max-w-[500px] mx-auto rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.1)] border border-white/10">
            {legend.imageUrl ? (
              <img
                src={legend.imageUrl}
                className="h-full w-full object-cover object-top grayscale-[0.5] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                alt={legend.name}
                style={{
                  maskImage:
                    "linear-gradient(to bottom, black 80%, transparent 100%)",
                }}
              />
            ) : (
              <div className="h-full w-full bg-zinc-900 flex items-center justify-center">
                <Trophy className="h-20 w-20 text-zinc-800" />
              </div>
            )}

            {/* OVERLAY GRADIENT ON IMAGE */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-transparent opacity-60" />
          </div>

          {/* FLOATING SPARKLE ANIMATION */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -top-10 -right-10 hidden lg:block"
          >
            <Sparkles className="h-12 w-12 text-gold/20" />
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
