"use client";

import { useState, useEffect } from "react";
import { CrudTable } from "@/components/admin/CrudTable";
import { CrudFormDialog } from "@/components/admin/CrudFormDialog";
import type { CrudField } from "@/lib/crud-field-types";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function PlayersAdminPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const load = async () => {
    const [pRes, tRes] = await Promise.all([
      fetch("/api/players").then((r) => r.json()),
      fetch("/api/teams").then((r) => r.json()),
    ]);
    setPlayers(Array.isArray(pRes) ? pRes : []);
    setTeams(Array.isArray(tRes) ? tRes : []);
  };

  useEffect(() => {
    load();
  }, []);

  const playerFields: CrudField[] = [
    {
      name: "photoUrl",
      label: "Photo",
      type: "image",
      bucket: "player-photos",
    },
    { name: "name", label: "Full Name", type: "text", required: true },
    {
      name: "teamId",
      label: "Include into Team Squad",
      type: "select",
      options: [
        { label: "-- Free Agent / Unassigned --", value: "none" },
        ...teams.map((t) => ({ label: t.name, value: t.id })),
      ],
    },
    {
      name: "position",
      label: "Position",
      type: "select",
      options: ["Goalkeeper", "Defender", "Midfielder", "Forward"].map((p) => ({
        label: p,
        value: p,
      })),
    },
    { name: "jerseyNumber", label: "Jersey Number", type: "number" },
    {
      name: "strongFoot",
      label: "Strong Foot",
      type: "select",
      options: [
        { label: "Right", value: "Right" },
        { label: "Left", value: "Left" },
        { label: "Both", value: "Both" },
      ],
    },
    { name: "bio", label: "Player Career Bio", type: "textarea" },
  ];

  const handleSave = async (values: Record<string, any>) => {
    const method = editing ? "PATCH" : "POST";
    const url = editing ? `/api/players/${editing.id}` : "/api/players";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (res.ok) {
      toast.success(editing ? "Athlete Profile Updated" : "Athlete Registered into Squad");
      setOpen(false);
      load();
    } else {
      toast.error("Failed to save player data");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-sm">
        <CrudTable
          title="Global Players & Squad Assignments"
          items={players}
          columns={[
            {
              id: "photo",
              key: "photoUrl",
              label: "Player",
              render: (p: any) => (
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full overflow-hidden bg-muted border border-border shrink-0">
                    {p.photoUrl ? (
                      <img src={p.photoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center font-bold text-xs">{p.name[0]}</div>
                    )}
                  </div>
                  <span className="font-bold text-foreground text-xs uppercase">{p.name}</span>
                </div>
              ),
            },
            {
              id: "team-frame",
              key: "teamId",
              label: "Team Frame",
              render: (p: any) =>
                p.team ? (
                  <div className="inline-flex items-center gap-2 bg-muted/40 border border-border px-2.5 py-1 rounded-full">
                    {p.team.logoUrl ? (
                      <img src={p.team.logoUrl} className="h-4 w-4 rounded-full object-cover" alt="" />
                    ) : (
                      <span className="h-4 w-4 rounded-full bg-pitch text-white text-[9px] flex items-center justify-center font-bold">
                        {p.team.name[0]}
                      </span>
                    )}
                    <span className="text-[10px] font-black uppercase text-foreground">{p.team.name}</span>
                  </div>
                ) : (
                  <Badge variant="outline" className="text-[9px] font-bold text-muted-foreground border-border">
                    Free Agent
                  </Badge>
                ),
            },
            { key: "position", label: "Position" },
            {
              key: "jerseyNumber",
              label: "Jersey #",
              render: (p: any) => (p.jerseyNumber ? `#${p.jerseyNumber}` : "-"),
            },
            { key: "strongFoot", label: "Foot" },
          ]}
          onCreate={() => {
            setEditing(null);
            setOpen(true);
          }}
          onEdit={(p) => {
            setEditing({ ...p, teamId: p.teamId || "none" });
            setOpen(true);
          }}
          onDelete={async (p) => {
            if (confirm(`Remove ${p.name} from roster?`)) {
              await fetch(`/api/players/${p.id}`, { method: "DELETE" });
              toast.success("Player removed");
              load();
            }
          }}
        />
      </div>

      <CrudFormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit Player & Team Assignment" : "Register New Athlete into Squad"}
        fields={playerFields}
        initialValues={editing}
        onSubmit={handleSave}
      />
    </div>
  );
}