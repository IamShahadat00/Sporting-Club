"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase";

export function useLiveMatch(matchId: string, initialData: any) {
  const [match, setMatch] = useState(initialData);

  useEffect(() => {
    const channel = supabaseClient
      .channel(`match-${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Match",
          filter: `id=eq.${matchId}`,
        },
        (payload) => setMatch((prev: any) => ({ ...prev, ...payload.new })),
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [matchId]);

  return match;
}
