// src/components/match-center/MatchTimer.tsx
"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { getMatchPhase } from "@/lib/utils";

export function MatchTimer({
  actualStart,
  status,
}: {
  actualStart: string | Date | null;
  status: string;
}) {
  const [phaseInfo, setPhaseInfo] = useState({
    phase: "1ST_HALF",
    minute: 0,
    label: "00:00",
  });

  useEffect(() => {
    if (status !== "LIVE" || !actualStart) return;

    const tick = () => {
      setPhaseInfo(getMatchPhase(actualStart));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [actualStart, status]);

  if (status === "FINISHED") {
    return (
      <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase">
        <Clock className="h-3.5 w-3.5" /> Full Time (45m)
      </div>
    );
  }

  if (status !== "LIVE") return null;

  return (
    <div className="flex items-center gap-2 text-xs font-mono font-bold text-danger animate-pulse">
      <Clock className="h-3.5 w-3.5" />
      <span>{phaseInfo.label}</span>
    </div>
  );
}
