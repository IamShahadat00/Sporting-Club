"use client"

import { useState, useEffect } from "react"
import { CrudTable } from "@/components/admin/CrudTable"
import { CrudFormDialog } from "@/components/admin/CrudFormDialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Building2 } from "lucide-react"

export default function SponsorsAdminPage() {
  const [sponsors, setSponsors] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)

  const load = () => fetch("/api/sponsors").then(r => r.json()).then(setSponsors)
  useEffect(() => { load() }, [])

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-pitch-dark">Sponsor Management</h1>
      </div>

      <div className="bg-card border-2 rounded-[1rem] overflow-hidden shadow-sm">
        <CrudTable
          title="Club Sponsors"
          items={sponsors}
          columns={[
            { key: "name", label: "Company" },
            { key: "tier", label: "Tier", render: (s) => <Badge className="bg-muted text-foreground border-pitch/30 uppercase text-[10px]">{s.tier}</Badge> },
            { key: "websiteUrl", label: "Link", render: (s) => <span className="text-xs text-muted-foreground">{s.websiteUrl || "No Link"}</span> }
          ]}
          onCreate={() => { setEditing(null); setOpen(true) }}
          onEdit={(s) => { setEditing(s); setOpen(true) }}
          onDelete={async (s) => {
            if(confirm("Remove partner?")) {
              await fetch(`/api/sponsors/${s.id}`, { method: "DELETE" })
              load()
            }
          }}
        />
      </div>

      <CrudFormDialog
        open={open} onOpenChange={setOpen} title={editing ? "Edit Sponsor" : "Add New Sponsor"}
        initialValues={editing}
        fields={[
          { name: "logoUrl", label: "Company Logo", type: "image", bucket: "banners" },
          { name: "name", label: "Company Name", type: "text", required: true },
          { name: "tier", label: "Tier (e.g. TITLE, GOLD, JERSEY SPONSOR)", type: "text", required: true },
          { name: "websiteUrl", label: "Website URL", type: "text" },
          { name: "description", label: "Company Goal / Description", type: "textarea" },
        ]}
        onSubmit={async (values) => {
          const method = editing ? "PATCH" : "POST"
          const url = editing ? `/api/sponsors/${editing.id}` : "/api/sponsors"
          await fetch(url, { method, body: JSON.stringify(values) })
          toast.success("Partnership data updated")
          setOpen(false)
          load()
        }}
      />
    </div>
  )
}