"use client";

import { useState, useEffect } from "react";
import { CrudTable } from "@/components/admin/CrudTable";
import { CrudFormDialog } from "@/components/admin/CrudFormDialog";
import type { CrudField } from "@/lib/crud-field-types";
import { toast } from "sonner";

export default function PlayersAdminPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const load = () =>
    fetch("/api/players")
      .then((r) => r.json())
      .then(setPlayers);

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
    { name: "name", label: "Full name", type: "text", required: true },
    {
      name: "position",
      label: "Position",
      type: "select",
      options: ["Goalkeeper", "Defender", "Midfielder", "Forward"].map((p) => ({
        label: p,
        value: p,
      })),
    },
    { name: "jerseyNumber", label: "Jersey number", type: "number" },
    { name: "district", label: "District", type: "text" },
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
      toast.success(editing ? "Athlete Profile Updated" : "Athlete Registered");
      setOpen(false);
      load();
    } else {
      toast.error("Failed to save player data");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border-2 p-8 rounded-[2rem] overflow-hidden shadow-sm">
        <CrudTable
          title="Global Players Pool"
          items={players}
          columns={[
            { key: "name", label: "Name" },
            { key: "position", label: "Position" },
            { key: "jerseyNumber", label: "Jersey #" },
            { key: "strongFoot", label: "Foot" },
          ]}
          onCreate={() => {
            setEditing(null);
            setOpen(true);
          }}
          onEdit={(p) => {
            setEditing(p);
            setOpen(true);
          }}
          onDelete={async (p) => {
            if (confirm("Delete player profile?")) {
              await fetch(`/api/players/${p.id}`, { method: "DELETE" });
              load();
            }
          }}
        />
      </div>
      <CrudFormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit Profile" : "Register New Athlete"}
        fields={playerFields}
        initialValues={editing}
        onSubmit={handleSave}
      />
    </div>
  );
}
