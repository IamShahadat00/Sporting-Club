"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  ArrowRight,
  Users,
  Shield,
  Megaphone,
  MapPin,
  ExternalLink,
  Calendar,
  Activity,
  Award,
} from "lucide-react";
import { AdBanner } from "@/components/layout/AdBanner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [stats, setStats] = useState({
    season: "Season 7",
    players: "0",
    teams: "0",
  });
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [p, t, s, n] = await Promise.all([
          fetch("/api/players").then((res) => res.json()),
          fetch("/api/teams").then((res) => res.json()),
          fetch("/api/tournaments").then((res) => res.json()),
          fetch("/api/announcements").then((res) => res.json()),
        ]);

        const active = s.find((item: any) => item.status === "ACTIVE");

        setStats({
          season: active ? active.name : "Season 7",
          players: Array.isArray(p) ? p.length.toString() : "0",
          teams: Array.isArray(t) ? t.length.toString() : "0",
        });

        // Only show active announcements
        if (Array.isArray(n)) {
          setNews(n.filter((a: any) => a.isActive).slice(0, 3));
        }
      } catch (e) {
        console.error("Data fetch error:", e);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#020617] text-white selection:bg-pitch selection:text-white">
      <AdBanner />
      <Navbar />

      <main className="flex-1 relative overflow-hidden">
        {/* VISIONARY AMBIENT LIGHTING */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-pitch/10 blur-[140px] rounded-full pointer-events-none" />

        {/* HERO SECTION */}
        <section className="relative z-10 py-24 md:py-30 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <Badge className="mb-8 bg-pitch/10 text-pitch border-pitch/20 px-8 py-1 rounded-full uppercase tracking-[0.4em] text-[14px] md:text-[14px] font-black shadow-[0_0_20px_rgba(16,185,129,0.1)]">
               Official Website
            </Badge>
            <h1 className="text-7xl md:text-[10rem] font-black italic tracking-tighter mb-8 leading-[0.85] uppercase">
              BADC Sporting <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pitch via-emerald-400 to-white drop-shadow-2xl">
                Club
              </span>
            </h1>

            <h2 className="text-xl md:text-[4rem] font-black italic tracking-tighter mb-6 leading-[0.85] uppercase">
              Game on <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pitch via-emerald-400 to-white drop-shadow-2xl">
                Fight on
              </span>
            </h2>

            <p className="text-slate-400 text-lg md:text-2xl max-w-2xl mx-auto mb-16 font-medium leading-relaxed italic">
              "Where legends take flight and every match defines history.
              Welcome to the heart of BADC competitive football."
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/tournament-hub">
                <Button className="bg-pitch hover:bg-pitch-dark text-black font-black uppercase text-lg h-16 px-10 rounded-2xl shadow-2xl shadow-pitch/30 group transition-all">
                  Tournament Hub{" "}
                  <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
              <Link href="/match-center">
                <Button
                  variant="outline"
                  className="border-white/10 bg-white/5 hover:bg-white/10 h-16 px-10 rounded-2xl font-black uppercase text-lg tracking-widest transition-all"
                >
                  Live Match Center
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* INDUSTRIAL STATS BAR (Dynamic Content) */}
        <section className="max-w-7xl mx-auto px-6  pb-5">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-2px bg-white/10 border border-white/10 rounded-[5rem] overflow-hidden backdrop-blur-3xl shadow-2xl"
          >
            <HomeStat
              label="Active Season"
              value={stats.season}
              icon={<Calendar className="text-pitch" />}
            />
            <HomeStat
              label="Registered Players"
              value={stats.players}
              icon={<Users className="text-sky" />}
            />
            <HomeStat
              label="Official Teams"
              value={stats.teams}
              icon={<Shield className="text-pitch" />}
            />
            <HomeStat
              label="Official Venue"
              value="Arena"
              subValue="BADC Playground"
              icon={<MapPin className="text-orange-500" />}
            />
          </motion.div>
        </section>

        {/* ANNOUNCEMENT SECTION (News & Events) */}
        <section className="max-w-7xl mx-auto px-4 py-20 border-t-2 border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="space-y-4">
              <Badge className="bg-pitch text-black font-black px-4 py-4 rounded-2xl uppercase tracking-widest text-[25px]">
                News & Events
              </Badge>
              <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter flex items-center gap-4">
                <Megaphone className="text-pitch h-10 w-10" /> Latest News
              </h2>
              <div className="h-2 w-24 bg-pitch rounded-full" />
            </div>
            <Link
              href="/news"
              className="font-black text-[10px] text-slate-500 hover:text-pitch uppercase tracking-[0.4em] transition-all border-b-2 border-transparent hover:border-pitch pb-2"
            >
              View All →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {news.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link href="/news" className="group block h-full">
                  <div className="bg-slate-900/40 border border-white/5 rounded-[2.8rem] overflow-hidden hover:border-pitch/40 transition-all shadow-2xl flex flex-col h-full">
                    <div className="aspect-[16/9] overflow-hidden relative">
                      {item.imageUrl && item.imageUrl.trim() !== "" ? (
                        <img
                          src={item.imageUrl}
                          className="w-full h-full object-fit group-hover:scale-110 transition-transform duration-1000"
                          alt={item.title}
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center italic text-slate-600 uppercase text-[10px] font-black">
                          No Media
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                    </div>
                    <div className="p-8 space-y-4 flex-1 flex flex-col">
                      <Badge
                        variant="secondary"
                        className="w-fit bg-pitch/10 text-pitch border-none font-black text-[9px] uppercase tracking-widest"
                      >
                        {item.type}
                      </Badge>
                      <h3 className="text-2xl font-black leading-tight group-hover:text-pitch transition-colors uppercase tracking-tight line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed font-medium italic">
                        "{item.content}"
                      </p>
                      <div className="mt-auto pt-6 flex items-center justify-between border-t border-white/5">
                        <span className="text-[10px] font-black text-pitch tracking-widest uppercase flex items-center gap-2 group-hover:gap-4 transition-all">
                          Read Report <ArrowRight className="h-3 w-3" />
                        </span>
                        {item.linkUrl && (
                          <ExternalLink className="h-3.5 w-3.5 text-slate-600" />
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
            {news.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-30 italic font-bold uppercase tracking-widest">
                Awaiting new updates from the club board...
              </div>
            )}
          </div>
        </section>

        {/* PLAYGROUND INTRODUCTION (Visionary Split Section) */}
        <section className="max-w-7xl mx-auto px-6 py-25">
          <div className="bg-slate-900 border border-white/5 rounded-[4rem] overflow-hidden flex flex-col lg:flex-row shadow-2xl relative">
            <div className="p-12 md:p-24 flex-1 space-y-8 relative z-10">
              <Badge className="bg-orange-500 text-white border-none font-black px-6 py-1 rounded-full uppercase tracking-widest text-[9px] shadow-lg shadow-orange-500/20">
                Football Field
              </Badge>
              <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
                The <br />
                <span className="text-orange-500">Arena</span>
              </h2>
              <p className="text-slate-300 text-xl leading-relaxed italic font-medium max-w-lg">
                "BADC Arena isn't just a playground; it's a fortress where the
                spirit of sportsmanship thrives. Located in the BADC Staff
                Quarter, our natural grass field has been the theater for
                championship glories for over a decade."
              </p>
              <div className="grid grid-cols-2 gap-10 pt-6">
                <div className="space-y-1">
                  <p className="text-3xl font-black italic text-white">
                    NATURAL
                  </p>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest underline decoration-pitch decoration-2 underline-offset-4">
                    Field Type
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-black italic text-white">
                    SMALL BAR
                  </p>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest underline decoration-pitch decoration-2 underline-offset-4">
                    Goal Posts
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-[500px] relative overflow-hidden group bg-slate-800">
              <img
                src="https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&q=80"
                className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                alt="The Arena"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/20 to-transparent lg:block hidden" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function HomeStat({ label, value, subValue, icon }: any) {
  return (
    <div className="p-12 text-center bg-slate-900/30 hover:bg-slate-900/60 transition-all border-r border-white/5 last:border-0 group">
      <div className="flex justify-center mb-6 scale-125 opacity-30 group-hover:opacity-100 group-hover:scale-150 group-hover:text-pitch transition-all duration-500">
        {icon}
      </div>
      <p className="text-4xl md:text-5xl font-black italic tracking-tighter text-white uppercase group-hover:text-pitch transition-colors">
        {value}
      </p>
      {subValue && (
        <p className="text-xs font-black text-slate-400 uppercase mt-2 tracking-[0.2em]">
          {subValue}
        </p>
      )}
      <p className="text-[10px] uppercase font-black text-slate-500 tracking-[0.3em] mt-6 opacity-50">
        {label}
      </p>
    </div>
  );
}
