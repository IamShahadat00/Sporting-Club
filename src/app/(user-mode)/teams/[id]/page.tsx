"use client";

import { useEffect, useState, use } from "react";
import {
  Trophy,
  User,
  ShieldCheck,
  ChevronDown,
  Briefcase,
} from "lucide-react";
import { motion } from "framer-motion";
import { BackButton } from "@/components/ui/back-button";

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
    fetch("/api/tournaments")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSeasons(data);
          const active = data.find((s: any) => s.status === "ACTIVE");
          if (active) setSelectedSeason(active.id);
        }
      });

    fetch(`/api/teams/${resolvedParams.id}`)
      .then((r) => r.json())
      .then((data) => setTeam(data))
      .catch((err) => console.error(err));
  }, [resolvedParams.id]);

  if (!team) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-pitch font-black uppercase text-sm tracking-widest animate-pulse">
        Loading Squad Dossier...
      </div>
    );
  }

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
    <div className="bg-background text-foreground min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 flex items-center justify-between gap-4">
        <BackButton fallbackHref="/teams" label="Teams Overview" />

        <div className="flex items-center gap-2 bg-card border border-border p-1.5 rounded-xl">
          <span className="text-[10px] font-black uppercase text-muted-foreground px-2">
            Season:
          </span>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="bg-background border-none rounded-lg px-2.5 py-1 text-xs font-black uppercase text-pitch outline-none cursor-pointer"
          >
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="py-16 sm:py-24 text-center px-4 max-w-5xl mx-auto space-y-6">
        <div className="relative inline-block">
          {team.logoUrl ? (
            <img
              src={team.logoUrl}
              className="h-32 w-32 sm:h-44 sm:w-44 mx-auto rounded-full border-4 border-pitch/30 shadow-xl bg-background object-cover p-1"
              alt=""
            />
          ) : (
            <div className="h-32 w-32 sm:h-44 sm:w-44 mx-auto rounded-full border-4 border-border bg-muted flex items-center justify-center font-black text-5xl text-muted-foreground">
              {team.name[0]}
            </div>
          )}
        </div>

        <h1 className="text-4xl sm:text-7xl md:text-8xl font-black uppercase italic tracking-tighter leading-none text-foreground break-words">
          {team.name}
        </h1>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 text-xs font-bold">
          <span className="bg-pitch/10 text-pitch px-3.5 py-1.5 rounded-full uppercase border border-pitch/20">
            {team.district || "Dhaka"}
          </span>
          <span className="bg-muted text-muted-foreground px-3.5 py-1.5 rounded-full uppercase border border-border">
            EST {team.founded || "Club"}
          </span>
          {team.titlesWon > 0 && (
            <span className="bg-amber-500/10 text-amber-500 px-3.5 py-1.5 rounded-full uppercase border border-amber-500/20 flex items-center gap-1.5">
              <Trophy className="h-3 w-3" /> {team.titlesWon} Titles
            </span>
          )}
        </div>

        <ChevronDown className="h-6 w-6 mx-auto mt-6 opacity-30 animate-bounce" />
      </section>

      {/* OWNER & MENTOR */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <ProfileCard
          title="Club Ownership"
          name={team.ownerName || "Club Management"}
          photo={team.ownerPhoto}
          bio={
            team.ownerBio ||
            "Committed to fostering athletic excellence, tactical discipline, and teamwork."
          }
        />
        <ProfileCard
          title="Team Mentor & Coach"
          name={team.mentorName || "To Be Assigned"}
          photo={team.mentorPhoto}
          bio={
            team.mentorBio ||
            "Guiding squad development and instilling competitive tournament integrity."
          }
        />
      </section>

      {/* LEADERSHIP: CAPTAIN & VICE CAPTAIN */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <LeadershipCard
            title="Team Captain"
            role="Captain"
            player={captain}
            accent="text-amber-500"
          />
          <LeadershipCard
            title="Vice Captain"
            role="Vice Captain"
            player={viceCaptain}
            accent="text-sky-500"
          />
        </div>
      </section>

      {/* SQUAD DIVISIONS */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-14 py-8">
        <SquadGroup title="Forwards" players={forwards} />
        <SquadGroup title="Midfielders" players={midfielders} />
        <SquadGroup title="Defenders" players={defenders} />
        <SquadGroup title="Goalkeepers" players={goalkeepers} />
      </div>
    </div>
  );
}

function ProfileCard({ title, name, photo, bio }: any) {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
      <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden bg-muted border border-border shrink-0">
        {photo ? (
          <img src={photo} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground/30">
            <User className="h-10 w-10" />
          </div>
        )}
      </div>
      <div className="space-y-1 text-center sm:text-left">
        <span className="text-[10px] font-black uppercase text-pitch tracking-wider">
          {title}
        </span>
        <h3 className="text-xl font-black uppercase text-foreground">{name}</h3>
        <p className="text-xs text-muted-foreground italic leading-relaxed">
          &quot;{bio}&quot;
        </p>
      </div>
    </div>
  );
}

function LeadershipCard({ title, role, player, accent }: any) {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 flex items-center gap-5 shadow-sm">
      <div className="h-20 w-20 rounded-2xl overflow-hidden bg-muted border border-border shrink-0">
        {player?.photoUrl ? (
          <img
            src={player.photoUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground/30">
            <ShieldCheck className="h-8 w-8" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <span
          className={`text-[10px] font-black uppercase tracking-wider ${accent}`}
        >
          {role}
        </span>
        <h4 className="text-lg font-black uppercase truncate text-foreground">
          {player?.name || "Pending Selection"}
        </h4>
        <p className="text-[11px] text-muted-foreground">
          Jersey #{player?.jerseyNumber ?? "-"}
        </p>
      </div>
    </div>
  );
}

function SquadGroup({ title, players }: any) {
  if (!players || players.length === 0) return null;
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-black uppercase italic tracking-tight border-l-4 border-pitch pl-3 text-foreground">
        {title}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {players.map((p: any) => (
          <div
            key={p.id}
            className="bg-card border border-border rounded-2xl p-4 text-center space-y-2 shadow-sm"
          >
            <div className="h-16 w-16 mx-auto rounded-full overflow-hidden bg-muted border border-border">
              {p.photoUrl ? (
                <img
                  src={p.photoUrl}
                  alt={p.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center font-bold text-xs">
                  {p.name[0]}
                </div>
              )}
            </div>
            <p className="font-bold text-xs uppercase truncate text-foreground">
              {p.name}
            </p>
            <span className="inline-block text-[10px] font-black uppercase text-muted-foreground">
              #{p.jerseyNumber ?? "-"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
