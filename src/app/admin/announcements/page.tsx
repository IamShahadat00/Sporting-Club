"use client";

import { useState, useEffect } from "react";
import { CrudTable } from "@/components/admin/CrudTable";
import { CrudFormDialog } from "@/components/admin/CrudFormDialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AnnouncementsAdminPage() {
  // 1. Added <any[]> here so TypeScript knows it's an array of items, not never[]
  const [news, setNews] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const load = () =>
    fetch("/api/announcements")
      .then((r) => r.json())
      .then(setNews);

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (values: Record<string, any>) => {
    const method = editing ? "PATCH" : "POST";
    const url = editing
      ? `/api/announcements/${editing.id}`
      : "/api/announcements";

    // Ensure boolean conversion for the DB
    const payload = {
      ...values,
      isActive: values.isActive === "true" || values.isActive === true,
    };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      toast.success(editing ? "Announcement Updated" : "News Published");
      setOpen(false);
      load();
    } else {
      toast.error("Error saving data");
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <Link
            href="/admin/dashboard"
            className="text-xs font-black uppercase text-muted-foreground hover:text-pitch flex items-center gap-2 mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> Dashboard
          </Link>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-pitch-dark">
            News & Events
          </h1>
        </div>
      </div>

      <div className="bg-card border-2 rounded-[1rem] overflow-hidden shadow-sm">
        <CrudTable
          title="Recent Bulletins"
          items={news}
          columns={[
            { key: "title", label: "Headline" },
            {
              key: "type",
              label: "Category",
              render: (n: any) => (
                <Badge variant="outline" className="text-[10px] font-black">
                  {n?.type}
                </Badge>
              ),
            },
            {
              key: "isActive",
              label: "Status",
              render: (n: any) =>
                n?.isActive ? (
                  <Badge className="bg-pitch">Visible</Badge>
                ) : (
                  <Badge variant="secondary">Hidden</Badge>
                ),
            },
          ]}
          onCreate={() => {
            setEditing(null);
            setOpen(true);
          }}
          onEdit={(n: any) => {
            setEditing(n);
            setOpen(true);
          }}
          onDelete={async (n: any) => {
            if (confirm("Delete this news item permanently?")) {
              await fetch(`/api/announcements/${n.id}`, { method: "DELETE" });
              toast.success("News deleted");
              load();
            }
          }}
        />
      </div>

      <CrudFormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit Bulletin" : "Create News"}
        initialValues={editing}
        fields={[
          {
            name: "imageUrl",
            label: "Cover Image (16:9 recommended)",
            type: "image",
            bucket: "banners",
          },
          { name: "title", label: "Headline", type: "text", required: true },
          {
            name: "type",
            label: "Category",
            type: "select",
            options: [
              { label: "News Update", value: "NEWS" },
              { label: "Match Event", value: "EVENT" },
              { label: "Official Statement", value: "UPDATE" },
            ],
          },
          {
            name: "content",
            label: "Body Content",
            type: "textarea",
            required: true,
          },
          {
            name: "linkUrl",
            label: "External Link (Facebook/YouTube)",
            type: "text",
          },
          {
            name: "isActive",
            label: "Publishing Status",
            type: "select",
            options: [
              { label: "Publicly Visible", value: true },
              { label: "Save as Draft (Hidden)", value: false },
            ],
          },
        ]}
        onSubmit={handleSave}
      />
    </div>
  );
}
