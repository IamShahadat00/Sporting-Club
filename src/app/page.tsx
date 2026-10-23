"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Users,
  Shield,
  Megaphone,
  MapPin,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { AdBanner, DynamicAdCard } from "@/components/layout/AdBanner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ModernAdSidebars } from "@/components/layout/ModernAdSidebars";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [stats, setStats] = useState({
    season: "Season 7",
    players: "0",
    teams: "0",
  });
  const [news, setNews] = useState<any[]>([]);
  const [featuredBanner, setFeaturedBanner] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [p, t, s, n, b] = await Promise.all([
          fetch("/api/players")
            .then((res) => res.json())
            .catch(() => []),
          fetch("/api/teams")
            .then((res) => res.json())
            .catch(() => []),
          fetch("/api/tournaments")
            .then((res) => res.json())
            .catch(() => []),
          fetch("/api/announcements")
            .then((res) => res.json())
            .catch(() => []),
          fetch("/api/banners")
            .then((res) => res.json())
            .catch(() => []),
        ]);

        const active = Array.isArray(s)
          ? s.find((item: any) => item.status === "ACTIVE")
          : null;

        setStats({
          season: active ? active.name : "Season 7",
          players: Array.isArray(p) ? p.length.toString() : "0",
          teams: Array.isArray(t) ? t.length.toString() : "0",
        });

        if (Array.isArray(n)) {
          setNews(n.filter((a: any) => a.isActive).slice(0, 3));
        }

        if (Array.isArray(b) && b.length > 0) {
          setFeaturedBanner(b[0]);
        }
      } catch (e) {
        console.error("Data fetch error:", e);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-pitch selection:text-white overflow-x-hidden">
      {/* Top Banner, Navigation & Animated Sidebars */}
      <AdBanner />
      <Navbar />
      <ModernAdSidebars />

      <main className="flex-1 relative w-full overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[320px] sm:w-[600px] md:w-[900px] h-[300px] md:h-[500px] bg-pitch/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Hero Section */}
        <section className="relative z-10 py-16 sm:py-24 md:py-32 px-4 sm:px-6 text-center max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <Badge className="mb-6 md:mb-8 bg-pitch/15 text-pitch border border-pitch/30 px-5 sm:px-8 py-1.5 rounded-full uppercase tracking-[0.3em] text-[11px] sm:text-xs font-black shadow-sm">
              Official Club Website
            </Badge>

            <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black italic tracking-tighter mb-4 sm:mb-6 leading-[0.95] sm:leading-[0.9] uppercase break-words w-full text-foreground">
              BADC Sporting <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pitch via-emerald-500 to-sky-500 drop-shadow-sm">
                Club
              </span>
            </h1>

            <h2 className="text-xl sm:text-3xl md:text-5xl font-black italic tracking-tight mb-6 uppercase text-foreground">
              Game on • <span className="text-pitch">Fight on</span>
            </h2>

            <p className="text-muted-foreground text-sm sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 sm:mb-14 font-medium leading-relaxed italic px-2">
              &quot;Where legends take flight and every match defines history.
              Welcome to the heart of BADC competitive football.&quot;
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full max-w-md sm:max-w-none">
              <Link href="/tournament-hub" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-pitch hover:bg-pitch-dark text-white font-black uppercase text-sm sm:text-base h-13 sm:h-16 px-8 rounded-2xl shadow-xl shadow-pitch/20 group transition-all">
                  Tournament Hub{" "}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
                </Button>
              </Link>
              <Link href="/match-center" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-border bg-card hover:bg-muted text-foreground h-13 sm:h-16 px-8 rounded-2xl font-black uppercase text-sm sm:text-base tracking-wider transition-all"
                >
                  Live Match Center
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Industrial Stats Bar */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-3xl md:rounded-[3rem] overflow-hidden shadow-xl"
          >
            <HomeStat
              label="Active Season"
              value={stats.season}
              icon={<Calendar className="text-pitch h-5 w-5 sm:h-6 sm:w-6" />}
            />
            <HomeStat
              label="Registered Players"
              value={stats.players}
              icon={<Users className="text-sky-500 h-5 w-5 sm:h-6 sm:w-6" />}
            />
            <HomeStat
              label="Official Teams"
              value={stats.teams}
              icon={<Shield className="text-pitch h-5 w-5 sm:h-6 sm:w-6" />}
            />
            <HomeStat
              label="Official Venue"
              value="Arena"
              subValue="BADC Ground"
              icon={<MapPin className="text-amber-500 h-5 w-5 sm:h-6 sm:w-6" />}
            />
          </motion.div>
        </section>

        {/* Dynamic Ad Card */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <DynamicAdCard
            title={
              featuredBanner?.linkUrl
                ? "Official Championship Partner"
                : "BADC Sporting Club Season Announcement"
            }
            description="Empowering young athletes and building sporting legacy. Check out our official merchandise and sponsor partnerships."
            ctaText="Learn More"
            linkUrl={featuredBanner?.linkUrl || "/tournament-hub"}
            imageUrl={featuredBanner?.imageUrl || undefined}
          />
        </section>

        {/* Announcement Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div className="space-y-3">
              <Badge className="bg-pitch text-white font-black px-4 py-1.5 rounded-xl uppercase tracking-widest text-xs">
                News & Events
              </Badge>
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black italic uppercase tracking-tighter flex items-center gap-3 text-foreground">
                <Megaphone className="text-pitch h-7 w-7 sm:h-9 sm:w-9" />{" "}
                Latest Updates
              </h2>
              <div className="h-1.5 w-20 bg-pitch rounded-full" />
            </div>
            <Link
              href="/news"
              className="font-black text-xs text-muted-foreground hover:text-pitch uppercase tracking-[0.25em] transition-all flex items-center gap-1.5"
            >
              View All Bulletins <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {news.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href="/news" className="group block h-full">
                  <div className="bg-card border border-border rounded-[2rem] overflow-hidden hover:border-pitch/50 transition-all shadow-md hover:shadow-xl flex flex-col h-full">
                    <div className="aspect-[16/9] overflow-hidden relative bg-muted">
                      {item.imageUrl && item.imageUrl.trim() !== "" ? (
                        <img
                          src={item.imageUrl}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          alt={item.title}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground uppercase text-[10px] font-black">
                          Club Update
                        </div>
                      )}
                    </div>

                    <div className="p-6 space-y-3 flex-1 flex flex-col">
                      <Badge
                        variant="secondary"
                        className="w-fit bg-pitch/10 text-pitch border border-pitch/20 font-black text-[9px] uppercase tracking-widest"
                      >
                        {item.type || "NEWS"}
                      </Badge>
                      <h3 className="text-xl font-black leading-snug group-hover:text-pitch transition-colors uppercase tracking-tight line-clamp-2 text-card-foreground">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground text-xs sm:text-sm line-clamp-3 leading-relaxed font-medium italic">
                        &quot;{item.content}&quot;
                      </p>
                      <div className="mt-auto pt-4 flex items-center justify-between border-t border-border">
                        <span className="text-[10px] font-black text-pitch tracking-widest uppercase flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                          Read Full <ArrowRight className="h-3 w-3" />
                        </span>
                        {item.linkUrl && (
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}

            {news.length === 0 && (
              <div className="col-span-full py-16 text-center border-2 border-dashed border-border rounded-3xl text-muted-foreground italic font-bold uppercase tracking-widest text-xs">
                Awaiting new updates from the club board...
              </div>
            )}
          </div>
        </section>

        {/* Playground Intro Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="bg-card border border-border rounded-3xl md:rounded-[3rem] overflow-hidden flex flex-col lg:flex-row shadow-xl">
            <div className="p-8 sm:p-12 md:p-16 flex-1 space-y-6">
              <Badge className="bg-amber-500 text-black border-none font-black px-4 py-1 rounded-full uppercase tracking-widest text-[9px]">
                Official Stadium
              </Badge>
              <h2 className="text-4xl sm:text-6xl md:text-7xl font-black italic uppercase tracking-tighter leading-tight text-card-foreground">
                The <br />
                <span className="text-amber-500">Arena</span>
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed italic font-medium">
                &quot;BADC Arena isn&apos;t just a playground; it&apos;s a
                fortress where the spirit of sportsmanship thrives. Located at
                the BADC Staff Quarter, our natural grass field has been the
                theater for championship glories for over a decade.&quot;
              </p>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border">
                <div className="space-y-1">
                  <p className="text-2xl sm:text-3xl font-black italic text-card-foreground">
                    NATURAL
                  </p>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                    Field Type
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl sm:text-3xl font-black italic text-card-foreground">
                    CHINESE / SMALL BAR
                  </p>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                    Goal Posts
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-[300px] lg:min-h-full relative overflow-hidden bg-muted">
              <img
                src="https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&q=80"
                className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                alt="BADC Arena"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function HomeStat({
  label,
  value,
  subValue,
  icon,
}: {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="p-6 sm:p-8 md:p-10 text-center bg-card hover:bg-muted/40 transition-all group flex flex-col justify-center items-center">
      <div className="mb-3 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
        {icon}
      </div>
      <p className="text-2xl sm:text-4xl md:text-5xl font-black italic tracking-tighter text-card-foreground uppercase group-hover:text-pitch transition-colors truncate max-w-full">
        {value}
      </p>
      {subValue && (
        <p className="text-[10px] sm:text-xs font-black text-muted-foreground uppercase mt-1 tracking-wider">
          {subValue}
        </p>
      )}
      <p className="text-[9px] sm:text-[10px] uppercase font-black text-muted-foreground tracking-widest mt-3 opacity-70">
        {label}
      </p>
    </div>
  );
}
