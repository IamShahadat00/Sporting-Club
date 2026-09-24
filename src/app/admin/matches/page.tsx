"use client";

import { useState, useEffect } from "react";
import { MatchCenterContent } from "@/components/shared/MatchCenterContent";
import { CrudFormDialog } from "@/components/admin/CrudFormDialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { CrudField } from "@/lib/crud-field-types";

export default function MatchesAdminPage() {
  const router = useRouter();
  const [data, setData] = useState<{
    today: any[];
    upcoming: any[];
    past: any[];
  }>({
    today: [],
    upcoming: [],
    past: [],
  });
  const [teams, setTeams] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/matches");
      const matches = await res.json();

      // Sort by Match Number primarily
      const sortedMatches = [...matches].sort(
        (a, b) => (a.matchNumber || 0) - (b.matchNumber || 0),
      );

      const now = new Date();
      const todayStr = now.toDateString();

      setData({
        // Matches scheduled for the current date
        today: sortedMatches.filter(
          (m: any) => new Date(m.scheduledStart).toDateString() === todayStr,
        ),
        // Matches scheduled in the future (Date is after today)
        upcoming: sortedMatches.filter((m: any) => {
          const mDate = new Date(m.scheduledStart);
          mDate.setHours(0, 0, 0, 0);
          const tDate = new Date();
          tDate.setHours(0, 0, 0, 0);
          return mDate > tDate;
        }),
        // Matches in the past or manually marked as FINISHED
        past: sortedMatches.filter((m: any) => {
          const mDate = new Date(m.scheduledStart);
          mDate.setHours(0, 0, 0, 0);
          const tDate = new Date();
          tDate.setHours(0, 0, 0, 0);
          return mDate < tDate || m.status === "FINISHED";
        }),
      });

      const tRes = await fetch("/api/teams");
      setTeams(await tRes.json());
      const sRes = await fetch("/api/tournaments");
      setSeasons(await sRes.json());
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this match?")) return;
    const res = await fetch(`/api/matches/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Match deleted");
      load();
    }
  };

  const handleCreate = async (values: Record<string, any>) => {
    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success(`Match scheduled!`);
        setOpen(false);
        load();
      } else {
        // Zod Error Object Parser
        if (result.error && typeof result.error === "object") {
          const fieldErrors = result.error.fieldErrors;
          const firstKey = Object.keys(fieldErrors)[0];
          const message = fieldErrors[firstKey][0];
          toast.error(`${firstKey}: ${message}`);
        } else {
          toast.error(result.error || "Check your data and try again.");
        }
      }
    } catch (e) {
      toast.error("Network error.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MatchCenterContent
        today={data.today}
        upcoming={data.upcoming}
        past={data.past}
        isAdmin={true}
        onDelete={handleDelete}
        onCreate={() => setOpen(true)}
      />

      <CrudFormDialog
        open={open}
        onOpenChange={setOpen}
        title="Schedule / Reschedule Match"
        fields={[
          {
            name: "matchNumber",
            label: "Match Serial #",
            type: "number",
            required: true,
          },
          {
            name: "seasonId",
            label: "Season",
            type: "select",
            required: true,
            options: seasons.map((s: any) => ({ label: s.name, value: s.id })),
          },
          {
            name: "homeTeamId",
            label: "Home Team",
            type: "select",
            required: true,
            options: teams.map((t: any) => ({ label: t.name, value: t.id })),
          },
          {
            name: "awayTeamId",
            label: "Away Team",
            type: "select",
            required: true,
            options: teams.map((t: any) => ({ label: t.name, value: t.id })),
          },
          {
            name: "scheduledStart",
            label: "Kickoff Time (Select date & time)",
            type: "date",
            required: true,
          },
          { name: "venue", label: "Venue", type: "text" },
          { name: "broadcastUrl", label: "Broadcast URL", type: "text" },
        ]}
        onSubmit={handleCreate}
      />
    </div>
  );
}
