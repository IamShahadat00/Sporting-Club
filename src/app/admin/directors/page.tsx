"use client";

import { useState, useEffect } from "react";
import { CrudTable } from "@/components/admin/CrudTable";
import { CrudFormDialog } from "@/components/admin/CrudFormDialog";
import type { CrudField } from "@/lib/crud-field-types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Inside directorFields
const directorFields: CrudField[] = [
  {
    name: "photoUrl",
    label: "Professional Portrait",
    type: "image",
    bucket: "player-photos",
  },
  { name: "name", label: "Full Name", type: "text", required: true },
  {
    name: "designation",
    label: "Board Designation",
    type: "text",
    required: true,
  },
  {
    name: "profession",
    label: "Business/Profession",
    type: "text",
    placeholder: "e.g. Managing Director, ABC Corp",
  },
  { name: "bio", label: "Director's Vision/Bio", type: "textarea" },
  { name: "order", label: "Display Priority", type: "number" },
];

export default function DirectorsAdminPage() {
  const [directors, setDirectors] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDirector, setEditingDirector] = useState<any | null>(null);

  const loadDirectors = () =>
    fetch("/api/directors")
      .then((r) => r.json())
      .then(setDirectors);
  useEffect(() => {
    loadDirectors();
  }, []);

  const handleSave = async (values: Record<string, any>) => {
    if (editingDirector) {
      await fetch(`/api/directors/${editingDirector.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
    } else {
      await fetch("/api/directors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
    }
    await loadDirectors();
  };

  const handleDelete = async (director: any) => {
    if (!confirm(`Remove ${director.name} from the board?`)) return;
    await fetch(`/api/directors/${director.id}`, { method: "DELETE" });
    setDirectors((prev) => prev.filter((d) => d.id !== director.id));
  };

  return (
    <div className="bg-card border-2 p-8 rounded-[2rem] overflow-hidden shadow-sm">
      <CrudTable
        title="Board of Directors"
        items={directors}
        columns={[
          {
            key: "photoUrl",
            label: "",
            render: (d) => (
              <Avatar className="h-9 w-9">
                <AvatarImage src={d.photoUrl} />
                <AvatarFallback>{d.name?.[0]}</AvatarFallback>
              </Avatar>
            ),
          },
          { key: "name", label: "Name" },
          { key: "designation", label: "Designation" },
        ]}
        onCreate={() => {
          setEditingDirector(null);
          setDialogOpen(true);
        }}
        onEdit={(d) => {
          setEditingDirector(d);
          setDialogOpen(true);
        }}
        onDelete={handleDelete}
      />

      <CrudFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingDirector ? "Edit director" : "Add director"}
        fields={directorFields}
        initialValues={editingDirector}
        onSubmit={handleSave}
      />
    </div>
  );
}
