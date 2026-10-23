// src/app/admin/users/page.tsx
"use client";

import { useState, useEffect } from "react";
import { CrudTable } from "@/components/admin/CrudTable";
import { CrudFormDialog } from "@/components/admin/CrudFormDialog";
import type { CrudField } from "@/lib/crud-field-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, X, Shield, Clock } from "lucide-react";

export default function UsersAdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const load = () =>
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => {});

  useEffect(() => {
    load();
  }, []);

  // 1. APPROVE A PENDING USER
  const handleApprove = async (user: any) => {
    const res = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved: true }),
    });

    if (res.ok) {
      toast.success(`${user.name} has been approved as ${user.role}!`);
      load();
    } else {
      toast.error("Failed to approve user.");
    }
  };

  // 2. REJECT / REVOKE A USER
  const handleReject = async (user: any) => {
    const res = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved: false }),
    });

    if (res.ok) {
      toast.info(`Access revoked for ${user.name}.`);
      load();
    } else {
      toast.error("Failed to revoke access.");
    }
  };

  const userFields: CrudField[] = [
    { name: "name", label: "Full Name", type: "text", required: true },
    { name: "email", label: "Email Address", type: "text", required: true },
    {
      name: "password",
      label: editing
        ? "New Password (leave blank to keep current)"
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
        { label: "Admin (Full Control)", value: "ADMIN" },
        { label: "Manager (Squad & Live Match Ops)", value: "MANAGER" },
        { label: "Editor (News & Bulletins)", value: "EDITOR" },
        { label: "Viewer", value: "VIEWER" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-card border-2 p-8 rounded-[2rem] overflow-hidden shadow-sm">
        <CrudTable
          title="User & Manager Access Approval"
          items={users}
          columns={[
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            {
              key: "role",
              label: "Assigned Role",
              render: (u) => (
                <Badge
                  className={
                    u.role === "ADMIN"
                      ? "bg-pitch text-black font-black"
                      : "bg-sky-500/10 text-sky-500 border border-sky-500/20 font-bold"
                  }
                >
                  {u.role}
                </Badge>
              ),
            },
            {
              id: "status-col",
              key: "isApproved",
              label: "Status & Approval Action",
              render: (u) => {
                if (u.role === "ADMIN") {
                  return (
                    <Badge
                      variant="outline"
                      className="border-pitch text-pitch font-bold"
                    >
                      <Shield className="h-3 w-3 mr-1" /> Built-in Admin
                    </Badge>
                  );
                }

                return (
                  <div className="flex items-center gap-2">
                    {u.isApproved ? (
                      <Badge className="bg-pitch text-white text-[10px] font-bold">
                        Approved
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-amber-500 text-amber-500 text-[10px] font-bold flex items-center gap-1"
                      >
                        <Clock className="h-3 w-3" /> Pending Review
                      </Badge>
                    )}

                    {!u.isApproved ? (
                      <Button
                        size="sm"
                        onClick={() => handleApprove(u)}
                        className="h-7 px-3 bg-pitch hover:bg-pitch-dark text-black font-black text-[10px] uppercase rounded-lg"
                      >
                        <Check className="h-3 w-3 mr-1" /> Approve
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(u)}
                        className="h-7 px-3 border-danger/30 text-danger hover:bg-danger/10 font-bold text-[10px] uppercase rounded-lg"
                      >
                        <X className="h-3 w-3 mr-1" /> Revoke
                      </Button>
                    )}
                  </div>
                );
              },
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
          onDelete={async (user) => {
            if (!confirm(`Delete ${user.name}'s account permanently?`)) return;
            const res = await fetch(`/api/users/${user.id}`, {
              method: "DELETE",
            });
            if (!res.ok) {
              const { error } = await res.json();
              return toast.error(error);
            }
            toast.success("Account deleted");
            load();
          }}
        />
      </div>

      <CrudFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? "Edit User Account" : "Create User Account"}
        fields={userFields}
        initialValues={editing}
        onSubmit={async (values) => {
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
          setDialogOpen(false);
          load();
        }}
      />
    </div>
  );
}
