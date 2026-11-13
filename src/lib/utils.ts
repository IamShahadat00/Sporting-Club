// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMatchTime(date: Date | string) {
  if (!date) return "";
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * BADC Tournament Clock Engine:
 * - 45 Minutes Total:
 *   - 0' to 20': 1st Half (20 mins)
 *   - 20' to 25': Halftime Break (5 mins)
 *   - 25' to 45': 2nd Half (20 mins)
 *   - After 45': FINISHED
 */
export function getAutomatedStatus(match: any) {
  if (match.status === "POSTPONED") return "POSTPONED";
  if (match.status === "FINISHED") return "FINISHED";

  const now = new Date().getTime();
  const start = new Date(match.scheduledStart).getTime();
  const matchDuration = 45 * 60 * 1000; // 45 minutes total
  const end = start + matchDuration;

  if (now < start) {
    return "SCHEDULED";
  }

  if (now >= start && now < end) {
    return "LIVE";
  }

  return "FINISHED";
}

export function getMatchPhase(actualStart: string | Date | null) {
  if (!actualStart) return { phase: "1ST_HALF", minute: 0, label: "00:00" };

  const startMs = new Date(actualStart).getTime();
  const diffMs = Math.max(0, Date.now() - startMs);
  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const remSeconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  if (totalMinutes < 20) {
    return {
      phase: "1ST_HALF",
      minute: totalMinutes + 1,
      label: `${pad(totalMinutes)}:${pad(remSeconds)} • 1st Half`,
    };
  } else if (totalMinutes < 25) {
    const breakRemaining = 25 - totalMinutes;
    return {
      phase: "HALF_TIME",
      minute: 20,
      label: `HT Break (${breakRemaining}m left)`,
    };
  } else if (totalMinutes < 45) {
    // 2nd half plays from 20' to 40' on official game clock
    const gameMinute = 20 + (totalMinutes - 25);
    return {
      phase: "2ND_HALF",
      minute: gameMinute + 1,
      label: `${pad(gameMinute)}:${pad(remSeconds)} • 2nd Half`,
    };
  } else {
    return {
      phase: "FINISHED",
      minute: 40,
      label: "FT (Full Time)",
    };
  }
}
