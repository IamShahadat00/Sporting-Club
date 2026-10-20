"use client";

import { useState, useEffect } from "react";
import { CrudTable } from "@/components/admin/CrudTable";
import { CrudFormDialog } from "@/components/admin/CrudFormDialog";
import type { CrudField } from "@/lib/crud-field-types";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const bannerFields: CrudField[] = [
  {
    name: "imageUrl",
    label: "Banner image",
    type: "image",
    bucket: "banners",
    required: true,
  },
  {
    name: "linkUrl",
    label: "Click-through URL",
    type: "text",
    placeholder: "https://...",
  },
  { name: "startAt", label: "Show from", type: "date", required: true },
  { name: "endAt", label: "Hide after", type: "date", required: true },
];

export default function BannersAdminPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const load = () =>
    fetch("/api/banners?admin=true")
      .then((r) => r.json())
      .then(setBanners);

  useEffect(() => {
    load();
  }, []);

  const scheduleStatus = (banner: any) => {
    const now = new Date();
    if (new Date(banner.startAt) > now)
      return <Badge variant="outline">Scheduled</Badge>;
    if (new Date(banner.endAt) < now)
      return <Badge variant="secondary">Expired</Badge>;
    return <Badge className="bg-pitch">Live</Badge>;
  };

  const handleSave = async (values: Record<string, any>): Promise<void> => {
    const url = editing ? `/api/banners/${editing.id}` : "/api/banners";
    const res = await fetch(url, {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(
        err?.error?.fieldErrors?.endAt?.[0] ?? "Failed to save banner",
      );
      return; // Return void instead of returning the toast object
    }

    toast.success(editing ? "Banner updated" : "Banner scheduled");
    await load();
  };

  const handleDelete = async (banner: any) => {
    if (!confirm("Delete this banner?")) return;
    await fetch(`/api/banners/${banner.id}`, { method: "DELETE" });
    toast.success("Banner deleted");
    setBanners((prev) => prev.filter((b) => b.id !== banner.id));
  };

  return (
    <>
      <CrudTable
        title="Advertisement Banners"
        items={banners}
        columns={[
          {
            key: "imageUrl",
            label: "Preview",
            render: (b: any) => (
              <img
                src={b.imageUrl}
                className="h-10 w-20 object-cover rounded"
                alt=""
              />
            ),
          },
          {
            id: "status-badge",
            key: "startAt",
            label: "Status",
            render: scheduleStatus,
          },
          {
            id: "window-text",
            key: "startAt",
            label: "Window",
            render: (b: any) =>
              `${new Date(b.startAt).toLocaleDateString()} → ${new Date(b.endAt).toLocaleDateString()}`,
          },
        ]}
        onCreate={() => {
          setEditing(null);
          setDialogOpen(true);
        }}
        onEdit={(b: any) => {
          setEditing(b);
          setDialogOpen(true);
        }}
        onDelete={handleDelete}
      />
      <CrudFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? "Edit banner" : "Schedule banner"}
        fields={bannerFields}
        initialValues={editing}
        onSubmit={async (values) => {
          await handleSave(values);
        }}
      />
    </>
  );
}