"use client";

import { useState, useEffect } from "react";
import { CrudTable } from "@/components/admin/CrudTable";
import { CrudFormDialog } from "@/components/admin/CrudFormDialog";
import type { CrudField } from "@/lib/crud-field-types";
import { toast } from "sonner";

export default function TeamsAdminPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const load = async () => {
    const [tRes, pRes] = await Promise.all([
      fetch("/api/teams").then((r) => r.json()),
      fetch("/api/players").then((r) => r.json()),
    ]);
    setTeams(tRes);
    setPlayers(pRes);
  };

  useEffect(() => {
    load();
  }, []);

  const teamFields: CrudField[] = [
    {
      name: "logoUrl",
      label: "Team Crest",
      type: "image",
      bucket: "player-photos",
    },
    { name: "name", label: "Team Name", type: "text", required: true },
    { name: "district", label: "Location", type: "text" },
    { name: "founded", label: "Established Year", type: "number" },
    { name: "titlesWon", label: "Titles Won", type: "number" },
    {
      name: "captainId",
      label: "Assign Captain",
      type: "select",
      options: players.map((p) => ({ label: p.name, value: p.id })),
    },
    {
      name: "viceCaptainId",
      label: "Assign Vice Captain",
      type: "select",
      options: players.map((p) => ({ label: p.name, value: p.id })),
    },
    { name: "ownerName", label: "Owner Name", type: "text" },
    {
      name: "ownerPhoto",
      label: "Owner Photo",
      type: "image",
      bucket: "player-photos",
    },
    { name: "ownerBio", label: "Owner Statement", type: "textarea" },
    { name: "mentorName", label: "Mentor/Coach", type: "text" },
    {
      name: "mentorPhoto",
      label: "Mentor Photo",
      type: "image",
      bucket: "player-photos",
    },
    { name: "mentorBio", label: "Mentor philosophy", type: "textarea" },
    {
      name: "sponsorLogo",
      label: "Sponsor Logo",
      type: "image",
      bucket: "banners",
    },
    { name: "description", label: "Official Club History", type: "textarea" },
  ];

  const handleSave = async (values: Record<string, any>) => {
    const url = editing ? `/api/teams/${editing.id}` : "/api/teams";
    const res = await fetch(url, {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      toast.success("Team updated successfully");
      setDialogOpen(false);
      load();
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="bg-card border-2 p-8 rounded-[2.5rem] shadow-sm">
        <CrudTable
          title="Leagues Teams"
          items={teams}
          columns={[
            { key: "name", label: "Team Name" },
            { key: "ownerName", label: "Owner" },
            { key: "district", label: "Location" },
          ]}
          onCreate={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
          onEdit={(t) => {
            setEditing(t);
            setDialogOpen(true);
          }}
          onDelete={async (t) => {
            if (confirm("Delete team?")) {
              await fetch(`/api/teams/${t.id}`, { method: "DELETE" });
              load();
            }
          }}
        />
      </div>
      <CrudFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? "Modify Team Profile" : "Register Team"}
        fields={teamFields}
        initialValues={editing}
        onSubmit={handleSave}
      />
    </div>
  );
}
