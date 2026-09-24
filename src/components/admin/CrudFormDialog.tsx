"use client"

import { useState, useEffect } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select"
import { ImageUploader } from "@/components/admin/ImageUploader"
import type { CrudField } from "@/lib/crud-field-types"
import { Loader2 } from "lucide-react"

interface CrudFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  fields: CrudField[]
  initialValues?: Record<string, any>
  onSubmit: (values: Record<string, any>) => Promise<void>
}

export function CrudFormDialog({
  open, onOpenChange, title, fields, initialValues, onSubmit,
}: CrudFormDialogProps) {
  const [values, setValues] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form whenever a different item (or a fresh "create") is opened
  useEffect(() => {
    if (open) {
      setValues(initialValues ?? {})
      setErrors({})
    }
  }, [open, initialValues])

  const setField = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const handleSubmit = async () => {
    const nextErrors: Record<string, string> = {}
    fields.forEach((f) => {
      if (f.required && !values[f.name]) nextErrors[f.name] = `${f.label} is required`
    })
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSaving(true)
    try {
      await onSubmit(values)
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>

        <div className="space-y-4 py-2">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="text-sm font-medium">{field.label}</label>

              {field.type === "text" && (
                <Input
                  placeholder={field.placeholder}
                  value={values[field.name] ?? ""}
                  onChange={(e) => setField(field.name, e.target.value)}
                />
              )}

              {field.type === "number" && (
                <Input
                  type="number"
                  placeholder={field.placeholder}
                  value={values[field.name] ?? ""}
                  onChange={(e) => setField(field.name, Number(e.target.value))}
                />
              )}

              {field.type === "date" && (
                <Input
                  type="datetime-local"
                  value={values[field.name] ?? ""}
                  onChange={(e) => setField(field.name, e.target.value)}
                />
              )}

              {field.type === "textarea" && (
                <Textarea
                  rows={3}
                  placeholder={field.placeholder}
                  value={values[field.name] ?? ""}
                  onChange={(e) => setField(field.name, e.target.value)}
                />
              )}

              {field.type === "select" && (
                <Select
                  value={values[field.name] ?? ""}
                  onValueChange={(v) => setField(field.name, v)}
                >
                  <SelectTrigger><SelectValue placeholder={field.placeholder ?? "Select..."} /></SelectTrigger>
                  <SelectContent>
                    {field.options?.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {field.type === "image" && (
                <ImageUploader
                  bucket={field.bucket ?? "player-photos"}
                  value={values[field.name]}
                  onChange={(url) => setField(field.name, url)}
                />
              )}

              {errors[field.name] && (
                <p className="text-xs text-danger mt-1">{errors[field.name]}</p>
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving} className="bg-pitch hover:bg-pitch-dark">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}