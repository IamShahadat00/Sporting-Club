// src/components/admin/CrudTable.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus } from "lucide-react";

export interface CrudColumn<T> {
  id?: string;
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface CrudTableProps<T extends { id: string }> {
  title: string;
  items: T[];
  columns: CrudColumn<T>[];
  onCreate: () => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
}

export function CrudTable<T extends { id: string }>({
  title,
  items,
  columns,
  onCreate,
  onEdit,
  onDelete,
}: CrudTableProps<T>) {
  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-foreground">
          {title}
        </h2>
        <Button
          onClick={onCreate}
          className="bg-pitch hover:bg-pitch-dark text-white text-xs font-black uppercase tracking-wider rounded-xl h-10 w-full sm:w-auto"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Add Record
        </Button>
      </div>

      <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table className="min-w-[550px] w-full text-xs sm:text-sm">
            <TableHeader className="bg-muted/50">
              <TableRow className="border-b border-border">
                {columns.map((col, idx) => (
                  <TableHead
                    key={col.id || String(col.key) || idx}
                    className="font-black uppercase text-[11px] tracking-wider text-muted-foreground whitespace-nowrap px-4 py-3"
                  >
                    {col.label}
                  </TableHead>
                ))}
                <TableHead className="text-right font-black uppercase text-[11px] tracking-wider text-muted-foreground px-4 py-3">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  {columns.map((col, idx) => (
                    <TableCell
                      key={`${item.id}-${col.id || String(col.key) || idx}`}
                      className="px-4 py-3 text-foreground whitespace-nowrap"
                    >
                      {col.render ? col.render(item) : String((item as any)[col.key] ?? "")}
                    </TableCell>
                  ))}
                  <TableCell className="text-right px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(item)}
                        className="h-8 w-8 text-foreground hover:bg-muted"
                        title="Edit record"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(item)}
                        className="h-8 w-8 text-danger hover:bg-danger/10"
                        title="Delete record"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {items.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 1}
                    className="text-center py-10 text-muted-foreground italic text-xs"
                  >
                    No records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}