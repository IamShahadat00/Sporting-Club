// src/components/match-center/SofascorePitchFormation.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Star,
  X,
  Check,
  ArrowLeftRight,
  Shield,
  User,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export interface PlayerNode {
  id: string;
  name: string;
  jerseyNumber?: number | null;
  position?: string | null;
  photoUrl?: string | null;
  isInjured?: boolean | null;
}

interface TeamLineupState {
  gk: PlayerNode | null;
  def: PlayerNode[];
  mid: PlayerNode[];
  fwd: PlayerNode[];
  subs: PlayerNode[];
}

export function SofascorePitchFormation({
  match,
  homeTeam,
  awayTeam,
  isAdmin = false,
}: {
  match: any;
  homeTeam: {
    id: string;
    name: string;
    logoUrl?: string | null;
    players: PlayerNode[];
  };
  awayTeam: {
    id: string;
    name: string;
    logoUrl?: string | null;
    players: PlayerNode[];
  };
  isAdmin?: boolean;
}) {
  const [ratings, setRatings] = useState<
    Record<string, { average: number; count: number }>
  >({});
  const [ratingModalPlayer, setRatingModalPlayer] = useState<PlayerNode | null>(
    null,
  );
  const [selectedStars, setSelectedStars] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  // Formations (default 1-3-2-2)
  const [homeFormation, setHomeFormation] = useState<string>("1-3-2-2");
  const [awayFormation, setAwayFormation] = useState<string>("1-3-2-2");

  // Structured squad lineups
  const [homeLineup, setHomeLineup] = useState<TeamLineupState>({
    gk: null,
    def: [],
    mid: [],
    fwd: [],
    subs: [],
  });
  const [awayLineup, setAwayLineup] = useState<TeamLineupState>({
    gk: null,
    def: [],
    mid: [],
    fwd: [],
    subs: [],
  });

  // Admin Swap State: Source player selected for swapping
  const [swapSource, setSwapSource] = useState<{
    player: PlayerNode;
    teamType: "HOME" | "AWAY";
    role: "gk" | "def" | "mid" | "fwd" | "subs";
    index?: number;
  } | null>(null);

  // Drag & drop source
  const [dragged, setDragged] = useState<{
    player: PlayerNode;
    teamType: "HOME" | "AWAY";
    role: "gk" | "def" | "mid" | "fwd" | "subs";
    index?: number;
  } | null>(null);

  // Initialize and reconstruct lineups (reading saved match.lineups or building guaranteed 1-3-2-2)
  useEffect(() => {
    const savedLineups = match?.lineups || {};
    const hForm = savedLineups.homeFormation || "1-3-2-2";
    const aForm = savedLineups.awayFormation || "1-3-2-2";
    setHomeFormation(hForm);
    setAwayFormation(aForm);

    setHomeLineup(
      buildStrictLineup(homeTeam.players || [], savedLineups.homeSlots, hForm),
    );
    setAwayLineup(
      buildStrictLineup(awayTeam.players || [], savedLineups.awaySlots, aForm),
    );
  }, [homeTeam.players, awayTeam.players, match.lineups]);

  const fetchRatings = async () => {
    try {
      const res = await fetch(`/api/ratings?matchId=${match.id}`);
      if (res.ok) setRatings(await res.json());
    } catch {}
  };

  useEffect(() => {
    fetchRatings();
  }, [match.id]);

  // Save tactical lineup to database
  const saveLineupToDb = async (
    hLine: TeamLineupState,
    aLine: TeamLineupState,
    hForm: string,
    aForm: string,
  ) => {
    if (!isAdmin) return;
    try {
      await fetch(`/api/matches/${match.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "lineup",
          lineups: {
            homeFormation: hForm,
            awayFormation: aForm,
            homeSlots: {
              gkId: hLine.gk?.id || null,
              defIds: hLine.def.map((p) => p.id),
              midIds: hLine.mid.map((p) => p.id),
              fwdIds: hLine.fwd.map((p) => p.id),
              subIds: hLine.subs.map((p) => p.id),
            },
            awaySlots: {
              gkId: aLine.gk?.id || null,
              defIds: aLine.def.map((p) => p.id),
              midIds: aLine.mid.map((p) => p.id),
              fwdIds: aLine.fwd.map((p) => p.id),
              subIds: aLine.subs.map((p) => p.id),
            },
          },
        }),
      });
    } catch {}
  };

  // Perform Swap Between Any Two Players
  const executeSwap = (target: {
    player: PlayerNode;
    teamType: "HOME" | "AWAY";
    role: "gk" | "def" | "mid" | "fwd" | "subs";
    index?: number;
  }) => {
    if (!swapSource) return;

    if (swapSource.teamType !== target.teamType) {
      toast.error("Can only swap players within the same team!");
      setSwapSource(null);
      setDragged(null);
      return;
    }

    if (swapSource.player.id === target.player.id) {
      setSwapSource(null);
      setDragged(null);
      return;
    }

    const teamType = swapSource.teamType;
    const currentLineup =
      teamType === "HOME" ? { ...homeLineup } : { ...awayLineup };

    // Deep clone arrays
    const newLineup: TeamLineupState = {
      gk: currentLineup.gk,
      def: [...currentLineup.def],
      mid: [...currentLineup.mid],
      fwd: [...currentLineup.fwd],
      subs: [...currentLineup.subs],
    };

    // Helper to replace a player in a specific role
    const replaceInRole = (
      role: "gk" | "def" | "mid" | "fwd" | "subs",
      idx: number | undefined,
      newP: PlayerNode,
    ) => {
      if (role === "gk") {
        newLineup.gk = newP;
      } else {
        const arr = newLineup[role];
        if (idx !== undefined && idx >= 0 && idx < arr.length) {
          arr[idx] = newP;
        } else {
          const findIdx = arr.findIndex(
            (p) =>
              p.id ===
              (role === swapSource.role
                ? swapSource.player.id
                : target.player.id),
          );
          if (findIdx !== -1) arr[findIdx] = newP;
        }
      }
    };

    replaceInRole(swapSource.role, swapSource.index, target.player);
    replaceInRole(target.role, target.index, swapSource.player);

    if (teamType === "HOME") {
      setHomeLineup(newLineup);
      saveLineupToDb(newLineup, awayLineup, homeFormation, awayFormation);
    } else {
      setAwayLineup(newLineup);
      saveLineupToDb(homeLineup, newLineup, homeFormation, awayFormation);
    }

    toast.success(`Swapped ${swapSource.player.name} ⇄ ${target.player.name}!`);
    setSwapSource(null);
    setDragged(null);
  };

  const submitRating = async () => {
    if (!ratingModalPlayer) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: match.id,
          playerId: ratingModalPlayer.id,
          rating: selectedStars,
        }),
      });

      if (res.ok) {
        toast.success(`Rated ${ratingModalPlayer.name} ${selectedStars}/10 ★`);
        setRatingModalPlayer(null);
        fetchRatings();
      }
    } catch {
      toast.error("Rating submission error");
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTeamAvg = (squad: TeamLineupState) => {
    const starters = [
      squad.gk,
      ...squad.def,
      ...squad.mid,
      ...squad.fwd,
    ].filter(Boolean) as PlayerNode[];
    const validRatings = starters
      .map((p) => ratings[p.id]?.average)
      .filter((r): r is number => typeof r === "number" && r > 0);
    if (!validRatings.length) return "0.0";
    const sum = validRatings.reduce((a, b) => a + b, 0);
    return (sum / validRatings.length).toFixed(1);
  };

  const homeTeamAvg = calculateTeamAvg(homeLineup);
  const awayTeamAvg = calculateTeamAvg(awayLineup);

  return (
    <section className="bg-card border-2 border-border rounded-3xl sm:rounded-[2.5rem] p-3 sm:p-7 shadow-2xl text-foreground space-y-4 overflow-hidden relative">
      {/* 1. TOP STATS BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-border pb-4">
        {/* Home Team */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-start">
          <div className="bg-pitch/20 text-pitch font-black text-xs sm:text-sm px-2.5 py-1 rounded-xl border border-pitch/30">
            {homeTeamAvg}★
          </div>
          <div className="flex items-center gap-2 truncate">
            {homeTeam.logoUrl && (
              <img
                src={homeTeam.logoUrl}
                alt=""
                className="h-6 w-6 sm:h-7 sm:w-7 rounded-full object-cover border border-border shrink-0"
              />
            )}
            <span className="font-black text-xs sm:text-sm uppercase truncate max-w-[130px] sm:max-w-none text-foreground">
              {homeTeam.name}
            </span>
          </div>
          <span className="text-[9px] font-black uppercase text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {homeFormation}
          </span>
        </div>

        {/* Center Help/Admin Mode */}
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <span className="bg-amber-500/10 text-amber-500 border border-amber-500/30 text-[9px] sm:text-[10px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              <ArrowLeftRight className="h-3 w-3" /> Admin Formation Manager
              (8-a-side)
            </span>
          ) : (
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hidden sm:inline">
              Click any player to rate (0 to 10 ★)
            </span>
          )}
        </div>

        {/* Away Team */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end flex-row-reverse">
          <div className="bg-sky-500/20 text-sky-400 font-black text-xs sm:text-sm px-2.5 py-1 rounded-xl border border-sky-500/30">
            {awayTeamAvg}★
          </div>
          <div className="flex items-center gap-2 flex-row-reverse truncate">
            {awayTeam.logoUrl && (
              <img
                src={awayTeam.logoUrl}
                alt=""
                className="h-6 w-6 sm:h-7 sm:w-7 rounded-full object-cover border border-border shrink-0"
              />
            )}
            <span className="font-black text-xs sm:text-sm uppercase truncate max-w-[130px] sm:max-w-none text-foreground">
              {awayTeam.name}
            </span>
          </div>
          <span className="text-[9px] font-black uppercase text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {awayFormation}
          </span>
        </div>
      </div>

      {/* 2. ACTIVE SELECTION BAR (When Admin taps a player to swap) */}
      {isAdmin && swapSource && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs shadow-md"
        >
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping" />
            <span className="font-black uppercase text-foreground">
              Ready to Swap:{" "}
              <strong className="text-pitch">{swapSource.player.name}</strong> (
              {swapSource.role.toUpperCase()})
            </span>
            <span className="text-muted-foreground text-[10px] hidden sm:inline">
              ➔ Click any other player on the ground or bench to swap!
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSwapSource(null)}
            className="px-3 py-1 rounded-lg bg-muted text-[10px] font-bold text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </motion.div>
      )}

      {/* 3. THE VIRTUAL PITCH (Guaranteed 8 Starters: 1 GK, 3 DEF, 2 MID, 2 FWD) */}
      <div className="relative w-full aspect-[16/11] sm:aspect-[16/9] min-h-[340px] bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 rounded-2xl sm:rounded-3xl border-2 border-white/15 overflow-hidden p-2 sm:p-4 shadow-inner">
        {/* Field Markings */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white transform -translate-y-1/2" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white transform -translate-x-1/2" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-28 w-28 sm:h-36 sm:w-36 rounded-full border border-white" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-40 sm:h-48 w-16 sm:w-24 border-r border-y border-white" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-40 sm:h-48 w-16 sm:w-24 border-l border-y border-white" />
        </div>

        {/* Players on Pitch */}
        <div className="relative z-10 w-full h-full flex">
          {/* HOME TEAM (Left to Center) */}
          <div className="w-1/2 h-full flex items-center justify-between pr-1 sm:pr-2">
            {/* 1 GK */}
            <div className="flex flex-col items-center justify-center p-1">
              <PitchSlot
                player={homeLineup.gk}
                ratings={ratings}
                matchEvents={match.events}
                isSelected={swapSource?.player.id === homeLineup.gk?.id}
                onClick={() => {
                  if (isAdmin) {
                    if (!swapSource)
                      setSwapSource({
                        player: homeLineup.gk!,
                        teamType: "HOME",
                        role: "gk",
                      });
                    else
                      executeSwap({
                        player: homeLineup.gk!,
                        teamType: "HOME",
                        role: "gk",
                      });
                  } else {
                    setRatingModalPlayer(homeLineup.gk);
                  }
                }}
                onDragStart={() =>
                  setDragged({
                    player: homeLineup.gk!,
                    teamType: "HOME",
                    role: "gk",
                  })
                }
                onDrop={() =>
                  dragged &&
                  executeSwap({
                    player: homeLineup.gk!,
                    teamType: "HOME",
                    role: "gk",
                  })
                }
                isAdmin={isAdmin}
              />
            </div>

            {/* 3 DEF */}
            <div className="flex flex-col justify-around h-full py-1">
              {homeLineup.def.map((p, idx) => (
                <PitchSlot
                  key={p.id}
                  player={p}
                  ratings={ratings}
                  matchEvents={match.events}
                  isSelected={swapSource?.player.id === p.id}
                  onClick={() => {
                    if (isAdmin) {
                      if (!swapSource)
                        setSwapSource({
                          player: p,
                          teamType: "HOME",
                          role: "def",
                          index: idx,
                        });
                      else
                        executeSwap({
                          player: p,
                          teamType: "HOME",
                          role: "def",
                          index: idx,
                        });
                    } else {
                      setRatingModalPlayer(p);
                    }
                  }}
                  onDragStart={() =>
                    setDragged({
                      player: p,
                      teamType: "HOME",
                      role: "def",
                      index: idx,
                    })
                  }
                  onDrop={() =>
                    dragged &&
                    executeSwap({
                      player: p,
                      teamType: "HOME",
                      role: "def",
                      index: idx,
                    })
                  }
                  isAdmin={isAdmin}
                />
              ))}
            </div>

            {/* 2 MID */}
            <div className="flex flex-col justify-around h-3/4 py-2">
              {homeLineup.mid.map((p, idx) => (
                <PitchSlot
                  key={p.id}
                  player={p}
                  ratings={ratings}
                  matchEvents={match.events}
                  isSelected={swapSource?.player.id === p.id}
                  onClick={() => {
                    if (isAdmin) {
                      if (!swapSource)
                        setSwapSource({
                          player: p,
                          teamType: "HOME",
                          role: "mid",
                          index: idx,
                        });
                      else
                        executeSwap({
                          player: p,
                          teamType: "HOME",
                          role: "mid",
                          index: idx,
                        });
                    } else {
                      setRatingModalPlayer(p);
                    }
                  }}
                  onDragStart={() =>
                    setDragged({
                      player: p,
                      teamType: "HOME",
                      role: "mid",
                      index: idx,
                    })
                  }
                  onDrop={() =>
                    dragged &&
                    executeSwap({
                      player: p,
                      teamType: "HOME",
                      role: "mid",
                      index: idx,
                    })
                  }
                  isAdmin={isAdmin}
                />
              ))}
            </div>

            {/* 2 FWD */}
            <div className="flex flex-col justify-around h-3/4 py-2">
              {homeLineup.fwd.map((p, idx) => (
                <PitchSlot
                  key={p.id}
                  player={p}
                  ratings={ratings}
                  matchEvents={match.events}
                  isSelected={swapSource?.player.id === p.id}
                  onClick={() => {
                    if (isAdmin) {
                      if (!swapSource)
                        setSwapSource({
                          player: p,
                          teamType: "HOME",
                          role: "fwd",
                          index: idx,
                        });
                      else
                        executeSwap({
                          player: p,
                          teamType: "HOME",
                          role: "fwd",
                          index: idx,
                        });
                    } else {
                      setRatingModalPlayer(p);
                    }
                  }}
                  onDragStart={() =>
                    setDragged({
                      player: p,
                      teamType: "HOME",
                      role: "fwd",
                      index: idx,
                    })
                  }
                  onDrop={() =>
                    dragged &&
                    executeSwap({
                      player: p,
                      teamType: "HOME",
                      role: "fwd",
                      index: idx,
                    })
                  }
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          </div>

          {/* AWAY TEAM (Center to Right) */}
          <div className="w-1/2 h-full flex items-center justify-between pl-1 sm:pl-2 flex-row-reverse">
            {/* 1 GK */}
            <div className="flex flex-col items-center justify-center p-1">
              <PitchSlot
                player={awayLineup.gk}
                ratings={ratings}
                matchEvents={match.events}
                isSelected={swapSource?.player.id === awayLineup.gk?.id}
                onClick={() => {
                  if (isAdmin) {
                    if (!swapSource)
                      setSwapSource({
                        player: awayLineup.gk!,
                        teamType: "AWAY",
                        role: "gk",
                      });
                    else
                      executeSwap({
                        player: awayLineup.gk!,
                        teamType: "AWAY",
                        role: "gk",
                      });
                  } else {
                    setRatingModalPlayer(awayLineup.gk);
                  }
                }}
                onDragStart={() =>
                  setDragged({
                    player: awayLineup.gk!,
                    teamType: "AWAY",
                    role: "gk",
                  })
                }
                onDrop={() =>
                  dragged &&
                  executeSwap({
                    player: awayLineup.gk!,
                    teamType: "AWAY",
                    role: "gk",
                  })
                }
                isAway
                isAdmin={isAdmin}
              />
            </div>

            {/* 3 DEF */}
            <div className="flex flex-col justify-around h-full py-1">
              {awayLineup.def.map((p, idx) => (
                <PitchSlot
                  key={p.id}
                  player={p}
                  ratings={ratings}
                  matchEvents={match.events}
                  isSelected={swapSource?.player.id === p.id}
                  onClick={() => {
                    if (isAdmin) {
                      if (!swapSource)
                        setSwapSource({
                          player: p,
                          teamType: "AWAY",
                          role: "def",
                          index: idx,
                        });
                      else
                        executeSwap({
                          player: p,
                          teamType: "AWAY",
                          role: "def",
                          index: idx,
                        });
                    } else {
                      setRatingModalPlayer(p);
                    }
                  }}
                  onDragStart={() =>
                    setDragged({
                      player: p,
                      teamType: "AWAY",
                      role: "def",
                      index: idx,
                    })
                  }
                  onDrop={() =>
                    dragged &&
                    executeSwap({
                      player: p,
                      teamType: "AWAY",
                      role: "def",
                      index: idx,
                    })
                  }
                  isAway
                  isAdmin={isAdmin}
                />
              ))}
            </div>

            {/* 2 MID */}
            <div className="flex flex-col justify-around h-3/4 py-2">
              {awayLineup.mid.map((p, idx) => (
                <PitchSlot
                  key={p.id}
                  player={p}
                  ratings={ratings}
                  matchEvents={match.events}
                  isSelected={swapSource?.player.id === p.id}
                  onClick={() => {
                    if (isAdmin) {
                      if (!swapSource)
                        setSwapSource({
                          player: p,
                          teamType: "AWAY",
                          role: "mid",
                          index: idx,
                        });
                      else
                        executeSwap({
                          player: p,
                          teamType: "AWAY",
                          role: "mid",
                          index: idx,
                        });
                    } else {
                      setRatingModalPlayer(p);
                    }
                  }}
                  onDragStart={() =>
                    setDragged({
                      player: p,
                      teamType: "AWAY",
                      role: "mid",
                      index: idx,
                    })
                  }
                  onDrop={() =>
                    dragged &&
                    executeSwap({
                      player: p,
                      teamType: "AWAY",
                      role: "mid",
                      index: idx,
                    })
                  }
                  isAway
                  isAdmin={isAdmin}
                />
              ))}
            </div>

            {/* 2 FWD */}
            <div className="flex flex-col justify-around h-3/4 py-2">
              {awayLineup.fwd.map((p, idx) => (
                <PitchSlot
                  key={p.id}
                  player={p}
                  ratings={ratings}
                  matchEvents={match.events}
                  isSelected={swapSource?.player.id === p.id}
                  onClick={() => {
                    if (isAdmin) {
                      if (!swapSource)
                        setSwapSource({
                          player: p,
                          teamType: "AWAY",
                          role: "fwd",
                          index: idx,
                        });
                      else
                        executeSwap({
                          player: p,
                          teamType: "AWAY",
                          role: "fwd",
                          index: idx,
                        });
                    } else {
                      setRatingModalPlayer(p);
                    }
                  }}
                  onDragStart={() =>
                    setDragged({
                      player: p,
                      teamType: "AWAY",
                      role: "fwd",
                      index: idx,
                    })
                  }
                  onDrop={() =>
                    dragged &&
                    executeSwap({
                      player: p,
                      teamType: "AWAY",
                      role: "fwd",
                      index: idx,
                    })
                  }
                  isAway
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. SQUAD BENCH SUBSTITUTES (Fully interactive swapping) */}
      <div className="pt-3 border-t border-border space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
            Substitutes Bench (Tap to Swap with Any Starter)
          </h4>
          {isAdmin && (
            <span className="text-[10px] text-pitch font-bold uppercase">
              1-Click Swap enabled
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Home Bench */}
          <div className="bg-muted/30 border border-border p-3 sm:p-4 rounded-2xl space-y-2">
            <span className="text-[10px] font-black uppercase text-pitch block">
              {homeTeam.name} Bench
            </span>
            <div className="space-y-1.5">
              {homeLineup.subs.map((p, idx) => (
                <BenchPlayerSlot
                  key={p.id}
                  player={p}
                  ratings={ratings}
                  matchEvents={match.events}
                  isSelected={swapSource?.player.id === p.id}
                  onClick={() => {
                    if (isAdmin) {
                      if (!swapSource)
                        setSwapSource({
                          player: p,
                          teamType: "HOME",
                          role: "subs",
                          index: idx,
                        });
                      else
                        executeSwap({
                          player: p,
                          teamType: "HOME",
                          role: "subs",
                          index: idx,
                        });
                    } else {
                      setRatingModalPlayer(p);
                    }
                  }}
                  onDragStart={() =>
                    setDragged({
                      player: p,
                      teamType: "HOME",
                      role: "subs",
                      index: idx,
                    })
                  }
                  onDrop={() =>
                    dragged &&
                    executeSwap({
                      player: p,
                      teamType: "HOME",
                      role: "subs",
                      index: idx,
                    })
                  }
                  isAdmin={isAdmin}
                />
              ))}
              {!homeLineup.subs.length && (
                <p className="text-xs text-muted-foreground italic py-1">
                  No substitutes available.
                </p>
              )}
            </div>
          </div>

          {/* Away Bench */}
          <div className="bg-muted/30 border border-border p-3 sm:p-4 rounded-2xl space-y-2">
            <span className="text-[10px] font-black uppercase text-sky-400 block">
              {awayTeam.name} Bench
            </span>
            <div className="space-y-1.5">
              {awayLineup.subs.map((p, idx) => (
                <BenchPlayerSlot
                  key={p.id}
                  player={p}
                  ratings={ratings}
                  matchEvents={match.events}
                  isSelected={swapSource?.player.id === p.id}
                  onClick={() => {
                    if (isAdmin) {
                      if (!swapSource)
                        setSwapSource({
                          player: p,
                          teamType: "AWAY",
                          role: "subs",
                          index: idx,
                        });
                      else
                        executeSwap({
                          player: p,
                          teamType: "AWAY",
                          role: "subs",
                          index: idx,
                        });
                    } else {
                      setRatingModalPlayer(p);
                    }
                  }}
                  onDragStart={() =>
                    setDragged({
                      player: p,
                      teamType: "AWAY",
                      role: "subs",
                      index: idx,
                    })
                  }
                  onDrop={() =>
                    dragged &&
                    executeSwap({
                      player: p,
                      teamType: "AWAY",
                      role: "subs",
                      index: idx,
                    })
                  }
                  isAdmin={isAdmin}
                />
              ))}
              {!awayLineup.subs.length && (
                <p className="text-xs text-muted-foreground italic py-1">
                  No substitutes available.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. USER RATING MODAL (0 to 10 STARS WITH 0 DEFAULT) */}
      <AnimatePresence>
        {ratingModalPlayer && !isAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-3xl p-6 max-w-sm w-full space-y-5 text-center shadow-2xl relative text-foreground"
            >
              <button
                type="button"
                onClick={() => setRatingModalPlayer(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="h-16 w-16 mx-auto rounded-full overflow-hidden border-2 border-pitch bg-muted">
                {ratingModalPlayer.photoUrl ? (
                  <img
                    src={ratingModalPlayer.photoUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center font-black text-xl">
                    {ratingModalPlayer.name[0]}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-black uppercase text-foreground">
                  {ratingModalPlayer.name}
                </h3>
                <p className="text-xs text-pitch font-bold uppercase tracking-wider">
                  #{ratingModalPlayer.jerseyNumber ?? "-"} •{" "}
                  {ratingModalPlayer.position || "Player"}
                </p>
              </div>

              {/* Star Rating Scale (0 to 10) */}
              <div className="space-y-2">
                <div className="text-2xl font-black text-amber-500">
                  {selectedStars === 0
                    ? "0.0 ★ (Neutral / No Rating)"
                    : `${selectedStars}.0 / 10 ★`}
                </div>
                <div className="grid grid-cols-6 gap-1.5 pt-1">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSelectedStars(star)}
                      className={`h-8 rounded-lg text-xs font-black transition-all ${
                        selectedStars === star
                          ? "bg-amber-400 text-black shadow-md scale-105"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {star}★
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRatingModalPlayer(null)}
                  className="flex-1 py-2.5 rounded-xl bg-muted text-xs font-bold uppercase text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitRating}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-pitch hover:bg-pitch-dark text-xs font-black text-white uppercase shadow-lg shadow-pitch/20 flex items-center justify-center gap-1"
                >
                  <Check className="h-4 w-4" />{" "}
                  {submitting ? "Saving..." : "Submit"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

// Single player on pitch with Cards / Injury / Goals badges
function PitchSlot({
  player,
  ratings,
  matchEvents = [],
  isSelected,
  onClick,
  onDragStart,
  onDrop,
  isAway = false,
  isAdmin = false,
}: {
  player: PlayerNode | null;
  ratings: Record<string, { average: number }>;
  matchEvents?: any[];
  isSelected?: boolean;
  onClick: () => void;
  onDragStart?: () => void;
  onDrop?: () => void;
  isAway?: boolean;
  isAdmin?: boolean;
}) {
  if (!player) return null;

  const events = (matchEvents as any[]) || [];
  const pName = player.name.toLowerCase().trim();
  const hasYellow = events.some(
    (e) => e?.type === "YELLOW" && e?.player?.toLowerCase().trim() === pName,
  );
  const hasRed = events.some(
    (e) => e?.type === "RED" && e?.player?.toLowerCase().trim() === pName,
  );
  const hasGoal = events.some(
    (e) => e?.type === "GOAL" && e?.player?.toLowerCase().trim() === pName,
  );
  const isInjured = player.isInjured === true;

  const ratingData = ratings[player.id];
  const score = ratingData ? ratingData.average : 0.0;
  const hasRating = score > 0;
  const isHigh = score >= 8.0;

  return (
    <div
      draggable={isAdmin}
      onDragStart={onDragStart}
      onDragOver={(e) => {
        if (isAdmin) e.preventDefault();
      }}
      onDrop={(e) => {
        if (isAdmin) {
          e.preventDefault();
          onDrop?.();
        }
      }}
      onClick={onClick}
      className={`relative group flex flex-col items-center cursor-pointer transition-transform hover:scale-105 active:scale-95 ${
        isSelected
          ? "ring-4 ring-pitch rounded-2xl scale-110 shadow-2xl z-30"
          : ""
      }`}
    >
      <div className="relative">
        {/* Rating Pill */}
        <div
          className={`absolute -top-2.5 -right-2.5 z-20 text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-md flex items-center gap-0.5 ${
            !hasRating
              ? "bg-slate-700 text-slate-300 border border-white/20"
              : isHigh
                ? "bg-pitch text-white border border-pitch"
                : score < 5.0
                  ? "bg-rose-600 text-white"
                  : isAway
                    ? "bg-sky-500 text-white"
                    : "bg-amber-500 text-black"
          }`}
        >
          <span>{score.toFixed(1)}</span>
          {hasRating && <Star className="h-2 w-2 fill-current" />}
        </div>

        {/* Tactical Badges: Card, Goal, Injury */}
        <div className="absolute -top-2 -left-2 z-20 flex items-center gap-0.5">
          {hasRed && (
            <span title="Red Card" className="text-xs leading-none">
              🟥
            </span>
          )}
          {hasYellow && !hasRed && (
            <span title="Yellow Card" className="text-xs leading-none">
              🟨
            </span>
          )}
          {hasGoal && (
            <span title="Goal Scored" className="text-xs leading-none">
              ⚽
            </span>
          )}
          {isInjured && (
            <span title="Injured" className="text-xs leading-none">
              🩹
            </span>
          )}
        </div>

        {/* Player Avatar */}
        <div
          className={`h-8 w-8 sm:h-11 sm:w-11 rounded-full overflow-hidden border-2 bg-slate-800 shadow-lg group-hover:border-pitch transition-colors ${
            hasRed
              ? "border-danger opacity-70"
              : isInjured
                ? "border-amber-400"
                : "border-white/80"
          }`}
        >
          {player.photoUrl ? (
            <img
              src={player.photoUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-[10px] font-black text-white">
              {player.name?.[0]}
            </div>
          )}
        </div>
      </div>

      <span className="text-[8px] sm:text-[10px] font-black text-white mt-1 uppercase truncate max-w-[50px] sm:max-w-[70px] drop-shadow-md">
        {player.jerseyNumber ? `${player.jerseyNumber}. ` : ""}
        {player.name.split(" ").slice(-1)[0]}
      </span>
    </div>
  );
}

function BenchPlayerSlot({
  player,
  ratings,
  matchEvents = [],
  isSelected,
  onClick,
  onDragStart,
  onDrop,
  isAdmin = false,
}: {
  player: PlayerNode;
  ratings: Record<string, { average: number }>;
  matchEvents?: any[];
  isSelected?: boolean;
  onClick: () => void;
  onDragStart?: () => void;
  onDrop?: () => void;
  isAdmin?: boolean;
}) {
  const avg = ratings[player.id]?.average ?? 0.0;
  const isInjured = player.isInjured === true;

  return (
    <div
      draggable={isAdmin}
      onDragStart={onDragStart}
      onDragOver={(e) => {
        if (isAdmin) e.preventDefault();
      }}
      onDrop={(e) => {
        if (isAdmin) {
          e.preventDefault();
          onDrop?.();
        }
      }}
      onClick={onClick}
      className={`w-full flex items-center justify-between p-2 rounded-xl bg-card border transition-all cursor-pointer ${
        isSelected
          ? "border-pitch ring-2 ring-pitch/40 bg-pitch/10"
          : "border-border hover:bg-muted/50"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="h-6 w-6 rounded-full overflow-hidden bg-muted border border-border shrink-0">
          {player.photoUrl ? (
            <img
              src={player.photoUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-[9px] font-bold flex items-center justify-center h-full">
              {player.name[0]}
            </span>
          )}
        </div>
        <span className="text-xs font-bold truncate text-foreground">
          {player.name}
        </span>
        <span className="text-[9px] text-muted-foreground uppercase">
          ({player.position || "Sub"})
        </span>
        {isInjured && <span title="Injured">🩹</span>}
      </div>

      <span className="text-[10px] font-black text-amber-500 shrink-0">
        {avg > 0 ? `${avg.toFixed(1)}★` : "0.0★"}
      </span>
    </div>
  );
}

/**
 * Strict 8-a-side Formation Builder (1-3-2-2)
 * GUARANTEES 8 STARTERS ON FIELD:
 * - 1 GK
 * - 3 DEF
 * - 2 MID
 * - 2 FWD
 * If a squad is missing natural positions (like Bengals had only 1 Forward),
 * it backfills the vacant starter slot from the remaining squad players so
 * it NEVER drops to 1-3-2-1!
 */
function buildStrictLineup(
  players: PlayerNode[],
  savedSlots: any,
  formation: string = "1-3-2-2",
): TeamLineupState {
  const pool = [...players];
  const assigned = new Set<string>();

  // If saved slots exist from prior admin customization, restore them
  if (savedSlots) {
    const gk = pool.find((p) => p.id === savedSlots.gkId) || null;
    if (gk) assigned.add(gk.id);

    const def = pool.filter((p) => savedSlots.defIds?.includes(p.id));
    def.forEach((p) => assigned.add(p.id));

    const mid = pool.filter((p) => savedSlots.midIds?.includes(p.id));
    mid.forEach((p) => assignedIds(p));

    const fwd = pool.filter((p) => savedSlots.fwdIds?.includes(p.id));
    fwd.forEach((p) => assignedIds(p));

    function assignedIds(p: PlayerNode) {
      assigned.add(p.id);
    }

    const subs = pool.filter((p) => !assigned.has(p.id));

    // If all starter slots are accounted for, return restored lineup
    if (gk && def.length === 3 && mid.length === 2 && fwd.length === 2) {
      return { gk, def, mid, fwd, subs };
    }
  }

  // --- AUTOMATIC 1-3-2-2 RESOLVER WITH GUARANTEED BACKFILL ---
  // 1. Assign GK
  let gk = pool.find((p) => p.position?.toLowerCase().includes("goalkeeper"));
  if (!gk && pool.length > 0) gk = pool[0];
  if (gk) assigned.add(gk.id);

  // 2. Assign DEF (up to 3)
  const naturalDefs = pool.filter(
    (p) =>
      !assigned.has(p.id) && p.position?.toLowerCase().includes("defender"),
  );
  const def = naturalDefs.slice(0, 3);
  def.forEach((p) => assigned.add(p.id));

  // 3. Assign MID (up to 2)
  const naturalMids = pool.filter(
    (p) =>
      !assigned.has(p.id) && p.position?.toLowerCase().includes("midfielder"),
  );
  const mid = naturalMids.slice(0, 2);
  mid.forEach((p) => assigned.add(p.id));

  // 4. Assign FWD (up to 2)
  const naturalFwds = pool.filter(
    (p) => !assigned.has(p.id) && p.position?.toLowerCase().includes("forward"),
  );
  const fwd = naturalFwds.slice(0, 2);
  fwd.forEach((p) => assigned.add(p.id));

  // 5. CRITICAL FIX: BACKFILL MISSING STARTER SLOTS!
  // If team has fewer than 2 forwards (e.g. BADC Bengals had 1), backfill from remaining players!
  const unassigned = pool.filter((p) => !assigned.has(p.id));

  while (def.length < 3 && unassigned.length > 0) {
    const promo = unassigned.shift()!;
    def.push(promo);
    assigned.add(promo.id);
  }

  while (mid.length < 2 && unassigned.length > 0) {
    const promo = unassigned.shift()!;
    mid.push(promo);
    assigned.add(promo.id);
  }

  while (fwd.length < 2 && unassigned.length > 0) {
    const promo = unassigned.shift()!;
    fwd.push(promo);
    assigned.add(promo.id);
  }

  // 6. Remaining squad players form the Substitutes Bench
  const subs = pool.filter((p) => !assigned.has(p.id));

  return { gk, def, mid, fwd, subs };
}
