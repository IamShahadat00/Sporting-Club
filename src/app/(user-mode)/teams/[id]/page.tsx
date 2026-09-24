"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Trophy,
  User,
  ShieldCheck,
  ArrowLeft,
  ChevronDown,
  Briefcase,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";

export default function TeamProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [team, setTeam] = useState<any>(null);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState("");

  useEffect(() => {
    // 1. Fetch seasons
    fetch("/api/tournaments")
      .then((r) => r.json())
      .then((data) => {
        setSeasons(data);
        const active = data.find((s: any) => s.status === "ACTIVE");
        if (active) setSelectedSeason(active.id);
      });

    // 2. Fetch specific team details
    fetch(`/api/teams/${resolvedParams.id}`)
      .then((r) => r.json())
      .then((data) => setTeam(data))
      .catch((err) => console.error("Arena connection error:", err));
  }, [resolvedParams.id]);

  if (!team)
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white font-black uppercase tracking-[0.5em] animate-pulse">
        Establishing Link...
      </div>
    );

  // Categorize Squad
  const squad = team.players || [];
  const captain = squad.find((p: any) => p.id === team.captainId);
  const viceCaptain = squad.find((p: any) => p.id === team.viceCaptainId);

  const forwards = squad.filter((p: any) =>
    p.position?.toLowerCase().includes("forward"),
  );
  const midfielders = squad.filter((p: any) =>
    p.position?.toLowerCase().includes("midfielder"),
  );
  const defenders = squad.filter((p: any) =>
    p.position?.toLowerCase().includes("defender"),
  );
  const goalkeepers = squad.filter((p: any) =>
    p.position?.toLowerCase().includes("goalkeeper"),
  );

  return (
    <div className="bg-[#020617] text-white min-h-screen selection:bg-pitch selection:text-black pb-20">
      {/* 1. STICKY NAV */}
      <nav className="fixed top-20 left-0 w-full z-50 px-6 py-4 flex justify-between items-center pointer-events-none">
        <Link
          href="/teams"
          className="pointer-events-auto inline-flex items-center gap-2 text-slate-500 hover:text-pitch font-black uppercase text-[10px] tracking-widest transition-all group bg-slate-900/80 backdrop-blur-xl p-3 rounded-2xl border border-white/5 shadow-2xl"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-2 transition-transform" />
          The Collective
        </Link>

        <div className="pointer-events-auto bg-slate-900/80 backdrop-blur-xl p-1 rounded-2xl border border-white/5 flex items-center gap-3 shadow-2xl">
          <span className="text-[9px] font-black uppercase tracking-tighter pl-3 opacity-40">
            Season
          </span>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="bg-slate-800 border-none rounded-xl px-4 py-2 text-xs font-black uppercase text-pitch outline-none cursor-pointer hover:bg-slate-700 transition-colors"
          >
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <SectionWrapper>
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-[0.04] z-0">
          <h1 className="text-[25vw] font-black italic uppercase leading-none whitespace-nowrap select-none">
            {team.name}
          </h1>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="text-center z-10 space-y-8 px-4"
        >
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-pitch/20 blur-[60px] rounded-full" />
            {team.logoUrl && team.logoUrl.trim() !== "" ? (
              <img
                src={team.logoUrl}
                className="h-48 w-48 md:h-64 md:w-64 mx-auto rounded-full border-[12px] border-white/5 shadow-2xl bg-white p-3 relative z-10"
                alt=""
              />
            ) : (
              <div className="h-48 w-48 md:h-64 md:w-64 mx-auto rounded-full border-[12px] border-white/5 bg-slate-800 flex items-center justify-center font-black text-6xl text-slate-600 relative z-10">
                {team.name[0]}
              </div>
            )}
          </div>
          <h1 className="text-6xl md:text-[10rem] font-black uppercase italic tracking-tighter leading-none drop-shadow-2xl">
            {team.name}
          </h1>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge
              label={team.district}
              color="bg-pitch"
              icon={<MapPin className="h-3 w-3" />}
            />
            <Badge label={`EST ${team.founded}`} color="bg-slate-800" />
            <Badge
              label={`${team.titlesWon} Championships`}
              color="bg-amber-500"
              icon={<Trophy className="h-3 w-3" />}
            />
          </div>
          <ChevronDown className="h-10 w-10 mx-auto mt-10 animate-bounce opacity-20" />
        </motion.div>
      </SectionWrapper>

      {/* 3. OWNER & MENTOR SLIDES */}
      <SectionWrapper bg="bg-slate-900/20">
        <ProfileSlide
          title="Team Owner"
          subTitle="Owner Thoughts"
          name={team.ownerName || "Management"}
          image={team.ownerPhoto}
          bio={
            team.ownerBio ||
            "The architectural force behind the club's infrastructure and long-term professional growth."
          }
        />
      </SectionWrapper>

      <SectionWrapper>
        <ProfileSlide
          title="Mentor/Coach"
          subTitle="Mentor"
          name={team.mentorName || "To Be Assigned"}
          image={team.mentorPhoto}
          bio={
            team.mentorBio ||
            "Orchestrating tactical discipline and high-performance standards across the entire squad."
          }
          reverse
        />
      </SectionWrapper>

      {/* 4. LEADERSHIP (Captain & VC) */}
      <SectionWrapper bg="bg-pitch/5">
        <div className="grid md:grid-cols-2 gap-16 max-w-6xl mx-auto w-full px-8">
          <div className="text-center space-y-8 group">
            <h2 className="text-pitch font-black tracking-[0.6em] uppercase text-[10px]">
              The General
            </h2>
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-pitch/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              {captain?.photoUrl && captain.photoUrl.trim() !== "" ? (
                <img
                  src={captain.photoUrl}
                  className="h-80 w-80 rounded-[3.5rem] object-cover border-4 border-pitch/20 group-hover:border-pitch shadow-2xl transition-all duration-700 relative z-10"
                  alt={captain.name}
                />
              ) : (
                <div className="h-80 w-80 rounded-[3.5rem] bg-slate-800 border-4 border-dashed border-white/10 flex items-center justify-center relative z-10">
                  <User className="h-20 w-20 opacity-5" />
                </div>
              )}
              <ShieldCheck className="absolute -bottom-4 -right-4 h-16 w-16 text-amber-500 fill-amber-500 z-20 shadow-2xl" />
            </div>
            <h3 className="text-5xl font-black uppercase italic tracking-tighter">
              {captain?.name || "Pending Selection"}
            </h3>
            <Badge label="CAPTAIN" color="bg-amber-500" />
          </div>

          <div className="text-center space-y-8 group">
            <h2 className="text-sky font-black tracking-[0.6em] uppercase text-[10px]">
              The Lieutenant
            </h2>
            <div className="relative inline-block">
              {viceCaptain?.photoUrl && viceCaptain.photoUrl.trim() !== "" ? (
                <img
                  src={viceCaptain.photoUrl}
                  className="h-80 w-80 rounded-[3.5rem] object-cover border-4 border-white/5 shadow-2xl grayscale group-hover:grayscale-0 group-hover:border-sky transition-all duration-700"
                  alt={viceCaptain.name}
                />
              ) : (
                <div className="h-80 w-80 rounded-[3.5rem] bg-slate-800 border-4 border-dashed border-white/10 flex items-center justify-center">
                  <User className="h-20 w-20 opacity-5" />
                </div>
              )}
            </div>
            <h3 className="text-5xl font-black uppercase italic tracking-tighter">
              {viceCaptain?.name || "Pending Selection"}
            </h3>
            <Badge label="VICE CAPTAIN" color="bg-sky" />
          </div>
        </div>
      </SectionWrapper>

      {/* 5. SQUAD SEGMENTS */}
      <SquadSection
        title="The Forwards"
        players={forwards}
        accent="text-rose-500"
        emoji="⚡"
      />
      <SquadSection
        title="The Midfielders"
        players={midfielders}
        accent="text-sky-500"
        emoji="⚙️"
      />
      <SquadSection
        title="The Defenders"
        players={defenders}
        accent="text-pitch"
        emoji="🛡️"
      />
      <SquadSection
        title="The Guardians"
        players={goalkeepers}
        accent="text-amber-500"
        emoji="👐"
      />

      {/* 6. TEAM BIO FOOTER */}
      <SectionWrapper bg="bg-slate-900/40">
        <div className="max-w-4xl text-center px-8">
          <Badge
            label="Official Dossier"
            color="bg-slate-800"
            className="mb-12"
          />
          <p className="text-3xl md:text-6xl font-light italic leading-tight tracking-tight text-slate-300">
            "
            {team.description ||
              "Forged in the competitive fires of the BADC Arena, representing the elite spirit of our sporting community."}
            "
          </p>
          {team.sponsorLogo && team.sponsorLogo.trim() !== "" && (
            <div className="mt-24 space-y-6 opacity-30 hover:opacity-100 transition-opacity duration-1000">
              <p className="text-[10px] font-black uppercase tracking-[0.5em]">
                Primary Strategic Partner
              </p>
              <img
                src={team.sponsorLogo}
                className="h-16 mx-auto grayscale invert"
                alt="Sponsor"
              />
            </div>
          )}
        </div>
      </SectionWrapper>
    </div>
  );
}

// --- SHARED UI HELPERS ---

function SectionWrapper({ children, bg = "" }: any) {
  return (
    <section
      className={`relative min-h-screen flex items-center justify-center overflow-hidden border-b border-white/5 ${bg}`}
    >
      {children}
    </section>
  );
}

function ProfileSlide({
  title,
  subTitle,
  name,
  image,
  bio,
  reverse = false,
}: any) {
  return (
    <div
      className={`max-w-7xl mx-auto px-8 grid md:grid-cols-2 items-center gap-20 w-full ${reverse ? "md:flex-row-reverse" : ""}`}
    >
      <motion.div
        initial={{ x: reverse ? 100 : -100, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className={reverse ? "md:order-2" : ""}
      >
        <p className="text-pitch font-black uppercase tracking-[0.6em] text-[10px] mb-6">
          {title}
        </p>
        <h2 className="text-7xl md:text-[9rem] font-black uppercase italic leading-[0.8] tracking-tighter mb-10">
          {name}
        </h2>
        <div className="bg-white/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10 max-w-lg shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Briefcase className="h-20 w-20" />
          </div>
          <p className="text-amber-500 font-black uppercase text-xs tracking-widest mb-4">
            {subTitle}
          </p>
          <p className="text-slate-400 text-lg leading-relaxed italic font-medium">
            "{bio}"
          </p>
        </div>
      </motion.div>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1 }}
        className={`relative ${reverse ? "md:order-1" : ""}`}
      >
        <div className="aspect-[4/5] w-full max-w-md mx-auto rounded-[4rem] overflow-hidden border-2 border-white/10 shadow-[0_0_80px_rgba(16,185,129,0.05)] relative group">
          {image && image.trim() !== "" ? (
            <img
              src={image}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              alt={name}
            />
          ) : (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
              <User className="h-32 w-32 opacity-5 text-white" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        </div>
      </motion.div>
    </div>
  );
}

function SquadSection({ title, players, accent, emoji }: any) {
  if (players.length === 0) return null;
  return (
    <section className="py-40 px-8 max-w-7xl mx-auto space-y-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="flex items-center gap-6"
      >
        <h2
          className={`text-7xl md:text-[10rem] font-black italic uppercase tracking-tighter ${accent} leading-none`}
        >
          {title}
        </h2>
        <span className="text-6xl md:text-9xl opacity-20">{emoji}</span>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {players.map((p: any, i: number) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -20 }}
            className="bg-slate-900/40 border border-white/5 rounded-[3.5rem] p-10 text-center group hover:border-pitch/50 transition-all shadow-2xl relative overflow-hidden"
          >
            <div className="h-44 w-44 mx-auto rounded-full overflow-hidden mb-8 border-4 border-white/5 group-hover:border-pitch transition-all relative ring-8 ring-transparent group-hover:ring-pitch/5">
              {p.photoUrl && p.photoUrl.trim() !== "" ? (
                <img
                  src={p.photoUrl}
                  className="h-full w-full object-cover"
                  alt={p.name}
                />
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                  <User className="h-16 w-16 opacity-5" />
                </div>
              )}
            </div>
            <h4 className="font-black text-2xl uppercase leading-none mb-3 tracking-tight">
              {p.name}
            </h4>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6">
              Serial #{p.jerseyNumber}
            </p>
            <p className="text-xs text-slate-400 italic font-medium leading-relaxed line-clamp-3">
              "
              {p.bio ||
                "Dedicated to the club's vision of sporting excellence and unity."}
              "
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Badge({ label, color, icon, className = "" }: any) {
  return (
    <span
      className={`${color} px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 shadow-2xl border border-white/10 ${className}`}
    >
      {icon} {label}
    </span>
  );
}

function MapPin(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
