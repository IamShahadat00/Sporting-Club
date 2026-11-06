"use client";

import { useState, useEffect } from "react";
import { MatchCenterContent } from "@/components/shared/MatchCenterContent";
import { CrudFormDialog } from "@/components/admin/CrudFormDialog";
import { toast } from "sonner";

function formatForDateTimeInput(dateStr?: string | Date | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function MatchesAdminPage() {
  const [data, setData] = useState<{
    today: any[];
    upcoming: any[];
    past: any[];
  }>({
    today: [],
    upcoming: [],
    past: [],
  });
  const [teams, setTeams] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<any | null>(null);

  const load = async () => {
    try {
      const [mRes, tRes, sRes] = await Promise.all([
        fetch("/api/matches").then((r) => r.json()),
        fetch("/api/teams").then((r) => r.json()),
        fetch("/api/tournaments").then((r) => r.json()),
      ]);

      const matches = Array.isArray(mRes) ? mRes : [];
      setTeams(Array.isArray(tRes) ? tRes : []);
      setSeasons(Array.isArray(sRes) ? sRes : []);

      const sortedMatches = [...matches].sort(
        (a, b) => (a.matchNumber || 0) - (b.matchNumber || 0),
      );

      const todayStr = new Date().toDateString();

      setData({
        today: sortedMatches.filter(
          (m: any) => new Date(m.scheduledStart).toDateString() === todayStr,
        ),
        upcoming: sortedMatches.filter((m: any) => {
          const mDate = new Date(m.scheduledStart);
          mDate.setHours(0, 0, 0, 0);
          const tDate = new Date();
          tDate.setHours(0, 0, 0, 0);
          return mDate > tDate;
        }),
        past: sortedMatches.filter((m: any) => {
          const mDate = new Date(m.scheduledStart);
          mDate.setHours(0, 0, 0, 0);
          const tDate = new Date();
          tDate.setHours(0, 0, 0, 0);
          return mDate < tDate || m.status === "FINISHED";
        }),
      });
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this match permanently?"))
      return;
    const res = await fetch(`/api/matches/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Match deleted successfully");
      load();
    } else {
      toast.error("Failed to delete match");
    }
  };

  const handleEdit = (match: any) => {
    setEditingMatch({
      ...match,
      scheduledStart: formatForDateTimeInput(match.scheduledStart),
    });
    setOpen(true);
  };

  const handleSave = async (values: Record<string, any>) => {
    try {
      const isEditing = Boolean(editingMatch?.id);
      const url = isEditing
        ? `/api/matches/${editingMatch.id}`
        : "/api/matches";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success(
          isEditing
            ? "Match details updated!"
            : "Match scheduled successfully!",
        );
        setOpen(false);
        setEditingMatch(null);
        load();
      } else {
        if (result.error?.fieldErrors) {
          const firstKey = Object.keys(result.error.fieldErrors)[0];
          toast.error(`${firstKey}: ${result.error.fieldErrors[firstKey][0]}`);
        } else {
          toast.error(result.error || "Please check your input values.");
        }
      }
    } catch (e) {
      toast.error("Network error while saving match.");
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
        onEdit={handleEdit}
        onCreate={() => {
          setEditingMatch(null);
          setOpen(true);
        }}
      />

      <CrudFormDialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setEditingMatch(null);
        }}
        title={
          editingMatch
            ? `Edit Match #${editingMatch.matchNumber}`
            : "Schedule New Match"
        }
        initialValues={editingMatch}
        fields={[
          {
            name: "matchNumber",
            label: "Match Serial #",
            type: "number",
            placeholder: "e.g. 1",
          },
          {
            name: "seasonId",
            label: "Tournament / Season",
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
            label: "Kickoff Date & Time",
            type: "date",
            required: true,
          },
          {
            name: "venue",
            label: "Stadium / Venue",
            type: "text",
            placeholder: "e.g. BADC Arena",
          },
          {
            name: "broadcastUrl",
            label: "Broadcast Channel URL",
            type: "text",
            placeholder: "https://youtube.com/watch?v=...",
          },
          {
            name: "status",
            label: "Match Status",
            type: "select",
            options: [
              { label: "Scheduled", value: "SCHEDULED" },
              { label: "Live", value: "LIVE" },
              { label: "Finished", value: "FINISHED" },
              { label: "Postponed", value: "POSTPONED" },
            ],
          },
        ]}
        onSubmit={handleSave}
      />
    </div>
  );
}
