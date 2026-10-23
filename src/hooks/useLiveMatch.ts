// src/hooks/useLiveMatch.ts
"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase";

export function useLiveMatch(matchId: string, initialData: any) {
  const [match, setMatch] = useState(initialData);

  useEffect(() => {
    if (!matchId) return;

    // Fetch immediately if initialData wasn't provided
    if (!initialData) {
      fetch(`/api/matches/${matchId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Match not found");
          return res.json();
        })
        .then((data) => setMatch(data))
        .catch((err) => console.error("Error fetching match data:", err));
    }

    // Subscribe to Supabase Realtime changes
    const actualId = initialData?.id || matchId;
    const channel = supabaseClient
      .channel(`match-${actualId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Match",
        },
        (payload) => {
          setMatch((prev: any) => {
            if (!prev) return payload.new;
            if (prev.id === payload.new.id) {
              return { ...prev, ...payload.new };
            }
            return prev;
          });
        },
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [matchId, initialData]);

  return match;
}
