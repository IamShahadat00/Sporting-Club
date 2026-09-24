"use client";

import { useState, useEffect } from "react";
import { CrudTable } from "@/components/admin/CrudTable";
import { CrudFormDialog } from "@/components/admin/CrudFormDialog";
import type { CrudField } from "@/lib/crud-field-types";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function UsersAdminPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const load = () =>
    fetch("/api/users")
      .then((r) => r.json())
      .then(setUsers);
  useEffect(() => {
    load();
  }, []);

  const userFields: CrudField[] = [
    { name: "name", label: "Full name", type: "text", required: true },
    { name: "email", label: "Email", type: "text", required: true },
    {
      name: "password",
      label: editing
        ? "New password (leave blank to keep current)"
        : "Password",
      type: "text",
      required: !editing,
    },
    {
      name: "role",
      label: "Role",
      type: "select",
      required: true,
      options: [
        { label: "Admin (full CRUD)", value: "ADMIN" },
        { label: "Editor (read-only)", value: "EDITOR" },
        { label: "Viewer (read-only)", value: "VIEWER" },
      ],
    },
  ];

  const handleSave = async (values: Record<string, any>) => {
    const url = editing ? `/api/users/${editing.id}` : "/api/users";
    const res = await fetch(url, {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return toast.error(err.error ?? "Failed to save user");
    }
    toast.success(editing ? "User updated" : "User created");
    await load();
  };

  const handleDelete = async (user: any) => {
    if (!confirm(`Delete ${user.name}'s account?`)) return;
    const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
    if (!res.ok) {
      const { error } = await res.json();
      return toast.error(error);
    }
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
  };

  return (
    <>
      <CrudTable
        title="Admin Users"
        items={users}
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          {
            key: "role",
            label: "Role",
            render: (u) => <Badge variant="outline">{u.role}</Badge>,
          },
          {
            key: "isApproved",
            label: "Approved",
            render: (u) => (u.isApproved ? "✅ Yes" : "⏳ Pending"),
          },
        ]}
        onCreate={() => {
          setEditing(null);
          setDialogOpen(true);
        }}
        onEdit={(u) => {
          setEditing({ ...u, password: "" });
          setDialogOpen(true);
        }}
        onDelete={handleDelete}
      />
      <CrudFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? "Edit user" : "Add user"}
        fields={userFields}
        initialValues={editing}
        onSubmit={handleSave}
      />
    </>
  );
}
