"use client";

import { useState, useEffect } from "react";
import { CrudTable } from "@/components/admin/CrudTable";
import { CrudFormDialog } from "@/components/admin/CrudFormDialog";
import { toast } from "sonner";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HallOfFameAdminPage() {
  const [items, setItems] = useState([]);
  const [players, setPlayers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const load = async () => {
    const res = await fetch("/api/hall-of-fame");
    setItems(await res.json());
    const pRes = await fetch("/api/players");
    setPlayers(await pRes.json());
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (values: any) => {
    const method = editing ? "PATCH" : "POST";
    const url = editing
      ? `/api/hall-of-fame/${editing.id}`
      : "/api/hall-of-fame";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (res.ok) {
      toast.success(editing ? "Legend Updated" : "Added to Hall of Fame");
      setOpen(false);
      load();
    } else {
      toast.error("Failed to save entry");
    }
  };

  const handleDelete = async (i: any) => {
    if (!confirm(`Are you sure you want to remove ${i.name}?`)) return;
    const res = await fetch(`/api/hall-of-fame/${i.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Legend removed");
      load();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <Link
            href="/admin/dashboard"
            className="text-xs font-black uppercase text-muted-foreground hover:text-pitch flex items-center gap-2 mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> Dashboard
          </Link>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-pitch-dark">
            Hall of Fame
          </h1>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="bg-pitch hover:bg-pitch-dark rounded-full px-8 font-bold"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Legend
        </Button>
      </div>

      <div className="bg-card border-2 p-8 rounded-[2rem] overflow-hidden shadow-sm">
        <CrudTable
          title="Inducted Legends"
          items={items}
          columns={[
            { key: "name", label: "Legend Name" },
            { key: "title", label: "Achievement" },
            { key: "year", label: "Active Period" },
          ]}
          onCreate={() => {
            setEditing(null);
            setOpen(true);
          }}
          onEdit={(i) => {
            setEditing(i);
            setOpen(true);
          }}
          onDelete={handleDelete}
        />
      </div>

      <CrudFormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit Legend Info" : "Induct New Legend"}
        initialValues={editing}
        fields={[
          {
            name: "imageUrl",
            label: "Legend Portrait (Transparent PNG looks best)",
            type: "image",
            bucket: "player-photos",
          },
          { name: "name", label: "Full Name", type: "text", required: true },
          {
            name: "title",
            label: "Special Title",
            type: "text",
            required: true,
            placeholder: "e.g. The Wall of BADC",
          },
          {
            name: "year",
            label: "Years of Glory",
            type: "text",
            required: true,
            placeholder: "e.g. 2018 - 2024",
          },
          {
            name: "description",
            label: "Legacy & Biography",
            type: "textarea",
          },
          {
            name: "playerId",
            label: "Link to existing player (Optional)",
            type: "select",
            options: players.map((p: any) => ({ label: p.name, value: p.id })),
          },
        ]}
        onSubmit={handleSave}
      />
    </div>
  );
}
