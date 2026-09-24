import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Standard Tailwind class merger
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats date to a clean time string (HH:MM AM/PM)
 * without seconds as requested.
 */
export function formatMatchTime(date: Date | string) {
  if (!date) return "";
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Automated Match Status Engine
 * Logic:
 * - Before start: SCHEDULED
 * - During (Start time + 100 mins): LIVE
 * - After (Start time + 100 mins): FINISHED
 */
export function getAutomatedStatus(match: any) {
  // 1. If match is manually Postponed, respect that first
  if (match.status === "POSTPONED") return "POSTPONED";

  // 2. If the admin manually set it to FINISHED in the DB, keep it that way
  if (match.status === "FINISHED") return "FINISHED";

  const now = new Date().getTime();
  const start = new Date(match.scheduledStart).getTime();
  const duration = 100 * 60 * 1000; // 100 minutes (90 mins + halftime/stoppage)
  const end = start + duration;

  // 3. Clock-based logic
  if (now < start) {
    return "SCHEDULED";
  }

  if (now >= start && now < end) {
    return "LIVE";
  }

  return "FINISHED";
}
