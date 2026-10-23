// src/components/admin/CrudFormDialog.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { CrudField } from "@/lib/crud-field-types";
import { Loader2 } from "lucide-react";

interface CrudFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  fields: CrudField[];
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => Promise<void>;
}

export function CrudFormDialog({
  open,
  onOpenChange,
  title,
  fields,
  initialValues,
  onSubmit,
}: CrudFormDialogProps) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setValues(initialValues ?? {});
      setErrors({});
    }
  }, [open, initialValues]);

  const setField = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async () => {
    const nextErrors: Record<string, string> = {};
    fields.forEach((f) => {
      if (
        f.required &&
        (values[f.name] === undefined || values[f.name] === "")
      ) {
        nextErrors[f.name] = `${f.label} is required`;
      }
    });

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    try {
      await onSubmit(values);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {fields.map((field) => {
            const currentValue = values[field.name];
            // Lookup the human readable label for select fields
            const selectedOption = field.options?.find(
              (opt) => String(opt.value) === String(currentValue),
            );

            return (
              <div key={field.name} className="space-y-1.5">
                <label className="text-xs font-black uppercase text-muted-foreground tracking-wider">
                  {field.label}{" "}
                  {field.required && <span className="text-danger">*</span>}
                </label>

                {field.type === "text" && (
                  <Input
                    placeholder={field.placeholder}
                    value={currentValue ?? ""}
                    onChange={(e) => setField(field.name, e.target.value)}
                  />
                )}

                {field.type === "number" && (
                  <Input
                    type="number"
                    placeholder={field.placeholder}
                    value={currentValue ?? ""}
                    onChange={(e) =>
                      setField(
                        field.name,
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                  />
                )}

                {field.type === "date" && (
                  <Input
                    type="datetime-local"
                    value={currentValue ?? ""}
                    onChange={(e) => setField(field.name, e.target.value)}
                  />
                )}

                {field.type === "textarea" && (
                  <Textarea
                    rows={3}
                    placeholder={field.placeholder}
                    value={currentValue ?? ""}
                    onChange={(e) => setField(field.name, e.target.value)}
                  />
                )}

                {field.type === "select" && (
                  <Select
                    value={String(currentValue ?? "")}
                    onValueChange={(v) => setField(field.name, v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={field.placeholder ?? "Select an option..."}
                      >
                        {selectedOption
                          ? selectedOption.label
                          : currentValue || undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt) => (
                        <SelectItem
                          key={String(opt.value)}
                          value={String(opt.value)}
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {field.type === "image" && (
                  <ImageUploader
                    bucket={field.bucket ?? "player-photos"}
                    value={currentValue}
                    onChange={(url) => setField(field.name, url)}
                  />
                )}

                {errors[field.name] && (
                  <p className="text-xs text-danger font-bold mt-1">
                    {errors[field.name]}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <DialogFooter className="pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-pitch hover:bg-pitch-dark text-black font-black"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
