import { prisma } from "@/lib/prisma";
import { SeasonBanner } from "@/components/tournament-hub/SeasonBanner";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Trophy,
  Users,
  GitBranch,
  ListOrdered,
  Star,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Globe,
  Award,
  Activity,
  ArrowLeft,
} from "lucide-react";

export default async function TournamentHubPage() {
  const activeSeason = await prisma.season.findFirst({
    where: { status: "ACTIVE" },
    include: { _count: { select: { registrations: true, matches: true } } },
  });

  if (!activeSeason) {
    return (
      <div className="max-w-3xl mx-auto py-24 text-center">
        <Trophy className="h-20 w-20 mx-auto text-muted-foreground mb-6 opacity-20" />
        <h1 className="text-3xl font-black uppercase italic tracking-tighter">
          No Active Tournament
        </h1>
        <p className="text-muted-foreground mt-2 font-medium">
          The board is currently organizing the next season. Stay tuned.
        </p>
        <Link href="/" className="mt-8 inline-block">
          <Badge
            variant="outline"
            className="px-6 py-2 border-pitch text-pitch hover:bg-pitch hover:text-white transition-all cursor-pointer"
          >
            Return Home
          </Badge>
        </Link>
      </div>
    );
  }

  // Fetch Stats and Sponsors
  const [topScorers, injured, mvps, allSponsors] = await Promise.all([
    prisma.player.findMany({
      where: { goals: { gt: 0 } },
      orderBy: { goals: "desc" },
      include: { team: true },
      take: 5,
    }),
    prisma.player.findMany({
      where: { isInjured: true },
      include: { team: true },
      take: 5,
    }),
    prisma.player.findMany({
      include: { _count: { select: { mvpAwards: true } }, team: true },
      orderBy: { mvpAwards: { _count: "desc" } },
      take: 3,
    }),
    prisma.sponsor.findMany({ orderBy: { order: "asc" } }),
  ]);

  // Organize Sponsors
  const titleSponsor = allSponsors.find(
    (s) => s.tier.toUpperCase() === "TITLE",
  );
  const otherSponsors = allSponsors.filter(
    (s) => s.tier.toUpperCase() !== "TITLE",
  );

  return (
    <div className="pb-20 bg-background min-h-screen selection:bg-pitch selection:text-white">
      {/* 1. BACK BUTTON */}
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-pitch font-black uppercase text-[10px] tracking-[0.3em] transition-all group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-2 transition-transform" />
          Back to Home
        </Link>
      </div>

      <SeasonBanner season={activeSeason} />

      {/* 2. NAVIGATION TILES */}
      <div className="max-w-6xl mx-auto px-4 -mt-16 grid gap-6 md:grid-cols-3 relative z-10">
        <HubCard
          href="/tournament-hub/register"
          icon={<Users className="h-8 w-8" />}
          title="Player Registration"
          sub={`${activeSeason._count.registrations} Enrolled`}
          color="bg-pitch"
        />
        <HubCard
          href="/tournament-hub/brackets"
          icon={<GitBranch className="h-8 w-8" />}
          title="Playoff Brackets"
          sub="Elimination Tree"
          color="bg-sky"
        />
        <HubCard
          href="/tournament-hub/standings"
          icon={<ListOrdered className="h-8 w-8" />}
          title="League Standings"
          sub="Official Points Table"
          color="bg-gold"
        />
      </div>

      {/* 3. SPONSOR PARTNERSHIP SHOWCASE (Large Cards) */}
      <section className="max-w-6xl mx-auto px-4 mt-32">
        <div className="flex flex-col items-center mb-16 space-y-4">
          <Badge className="bg-muted text-pitch-dark font-black px-6 py-1 rounded-full border border-pitch/20 tracking-[0.4em] text-[10px]">
            PARTNERSHIPS
          </Badge>
          <h2 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-center">
            The Driving{" "}
            <span className="text-pitch underline decoration-8 decoration-pitch/20">
              Force
            </span>
          </h2>
        </div>

        {/* TITLE SPONSOR (Hero Card) */}
        {titleSponsor && (
          <div className="relative group mb-12">
            <div className="absolute inset-0 bg-pitch/5 blur-[120px] rounded-full opacity-40 group-hover:opacity-60 transition-opacity" />
            <div className="relative bg-card border-4 border-pitch/30 rounded-[3.5rem] p-10 md:p-20 flex flex-col md:flex-row items-center gap-16 shadow-2xl transition-all hover:border-pitch">
              <div className="shrink-0 p-10 bg-white rounded-[3rem] shadow-2xl border-8 border-muted">
                <img
                  src={titleSponsor.logoUrl || ""}
                  className="h-48 w-48 md:h-72 md:w-72 object-contain grayscale group-hover:grayscale-0 transition-all duration-1000"
                  alt={titleSponsor.name}
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="inline-block px-6 py-2 bg-pitch text-black font-black uppercase italic text-sm transform -skew-x-12 mb-6 shadow-lg shadow-pitch/20">
                  PRIMARY TITLE SPONSOR
                </div>
                <h3 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-6">
                  {titleSponsor.name}
                </h3>
                <p className="text-muted-foreground text-xl md:text-2xl italic leading-relaxed max-w-2xl border-l-8 border-pitch pl-8 mb-8">
                  "
                  {titleSponsor.description ||
                    "Leading the charge in professional sports and community excellence."}
                  "
                </p>
                {titleSponsor.websiteUrl && (
                  <a
                    href={titleSponsor.websiteUrl}
                    target="_blank"
                    className="inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 rounded-2xl font-black uppercase text-xs hover:bg-pitch hover:text-black transition-all shadow-xl"
                  >
                    Visit Official Portal <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PARTNER GRID (Large Industrial Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {otherSponsors.map((s) => (
            <div
              key={s.id}
              className="bg-card border-4 border-muted rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-8 group hover:border-pitch hover:shadow-2xl transition-all relative overflow-hidden"
            >
              <div className="shrink-0 h-40 w-40 flex items-center justify-center bg-white rounded-[2rem] p-6 shadow-lg border-2 border-muted group-hover:border-pitch/20 transition-colors">
                <img
                  src={s.logoUrl || ""}
                  className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-700"
                  alt={s.name}
                />
              </div>
              <div className="flex-1 text-center md:text-left space-y-3">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="text-[10px] font-black text-pitch uppercase tracking-[0.2em]">
                    {s.tier}
                  </span>
                  <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                  {s.websiteUrl && (
                    <Globe className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                <h4 className="font-black text-3xl uppercase tracking-tighter leading-tight group-hover:text-pitch transition-colors">
                  {s.name}
                </h4>
                <p className="text-sm text-muted-foreground italic leading-relaxed line-clamp-3">
                  "
                  {s.description ||
                    "A committed partner supporting the vision of BADC Sporting Club."}
                  "
                </p>
                {s.websiteUrl && (
                  <a
                    href={s.websiteUrl}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-pitch-dark hover:underline pt-2"
                  >
                    Official Link <ArrowRight className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. STATISTICS SECTION */}
      <div className="max-w-6xl mx-auto px-4 mt-40">
        <div className="flex items-center justify-between mb-12 border-b-4 border-muted pb-6">
          <h2 className="text-5xl font-black italic uppercase tracking-tighter">
            Tournament <span className="text-pitch">Analytics</span>
          </h2>
          <Activity className="h-12 w-12 text-pitch animate-pulse" />
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {/* GOLDEN BOOT */}
          <StatBox
            title="Golden Boot"
            icon={<Trophy className="text-gold h-5 w-5" />}
          >
            {topScorers.map((p, idx) => (
              <div
                key={p.id}
                className="flex justify-between items-center py-5 border-b border-muted/50 last:border-0 hover:bg-muted/10 transition-all px-4 rounded-2xl group"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-muted-foreground opacity-30">
                    0{idx + 1}
                  </span>
                  <div className="h-12 w-12 rounded-full border-2 border-pitch/30 bg-muted overflow-hidden flex items-center justify-center">
                    {p.photoUrl ? (
                      <img
                        src={p.photoUrl}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform"
                        alt=""
                      />
                    ) : (
                      <span className="font-black">{p.name[0]}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-sm uppercase truncate">
                      {p.name}
                    </p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">
                      {p.team?.name || "Free Agent"}
                    </p>
                  </div>
                </div>
                <span className="text-4xl font-black text-pitch italic group-hover:translate-x-[-4px] transition-transform">
                  {p.goals}
                </span>
              </div>
            ))}
            {topScorers.length === 0 && (
              <EmptyStat text="The hunt for goals begins with Match #01" />
            )}
          </StatBox>

          {/* MEDICAL ROOM */}
          <StatBox
            title="Medical Room"
            icon={<AlertCircle className="text-danger h-5 w-5" />}
          >
            {injured.map((p) => (
              <div
                key={p.id}
                className="flex justify-between items-center py-5 border-b border-muted/50 last:border-0 px-4"
              >
                <div className="flex flex-col">
                  <span className="font-black text-base uppercase text-foreground">
                    {p.name}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    {p.team?.name}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] text-danger border-danger font-black bg-danger/5 px-4 py-1 rounded-lg"
                >
                  UNAVAILABLE
                </Badge>
              </div>
            ))}
            {injured.length === 0 && (
              <EmptyStat text="Full squad fitness. No injuries reported." />
            )}
          </StatBox>

          {/* ELITE PERFORMANCE */}
          <StatBox
            title="Performance"
            icon={<Star className="text-sky h-5 w-5" />}
          >
            {mvps.map((p) => (
              <div
                key={p.id}
                className="flex justify-between items-center py-5 border-b border-muted/50 last:border-0 px-4"
              >
                <div className="flex flex-col">
                  <span className="font-black text-base uppercase">
                    {p.name}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    {p.team?.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-sky/10 px-4 py-2 rounded-2xl border border-sky/20">
                  <Award className="h-4 w-4 text-sky" />
                  <span className="font-black text-sky text-sm uppercase">
                    {p._count.mvpAwards} MVP
                  </span>
                </div>
              </div>
            ))}
            {mvps.length === 0 && (
              <EmptyStat text="Awards will be finalized after the fixtures." />
            )}
          </StatBox>
        </div>
      </div>
    </div>
  );
}

// --- SHARED UI COMPONENTS ---

function HubCard({ href, icon, title, sub, color }: any) {
  return (
    <Link href={href} className="group h-full">
      <div className="bg-card border-4 p-10 rounded-[3rem] shadow-2xl group-hover:-translate-y-3 transition-all group-hover:border-pitch h-full border-muted/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
        <div
          className={`${color} w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-8 shadow-2xl group-hover:rotate-12 transition-transform`}
        >
          {icon}
        </div>
        <h3 className="text-2xl font-black uppercase tracking-tight mb-2 leading-none">
          {title}
        </h3>
        <p className="text-[11px] text-muted-foreground font-black uppercase tracking-[0.2em] flex items-center gap-3 opacity-60 group-hover:opacity-100 transition-all">
          {sub}{" "}
          <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
        </p>
      </div>
    </Link>
  );
}

function StatBox({ title, icon, children }: any) {
  return (
    <div className="bg-card border-4 rounded-[3.5rem] p-10 shadow-lg h-full border-muted/20">
      <div className="flex items-center gap-3 mb-10 font-black uppercase text-[12px] tracking-[0.4em] text-muted-foreground border-b-2 border-muted pb-5">
        {icon} {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function EmptyStat({ text }: { text: string }) {
  return (
    <div className="py-20 px-8 text-center bg-muted/10 rounded-[2.5rem] border-2 border-dashed border-muted">
      <p className="text-muted-foreground text-[11px] uppercase font-black tracking-widest leading-relaxed italic opacity-40">
        {text}
      </p>
    </div>
  );
}
