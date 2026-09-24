"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Plus } from "lucide-react"

export interface CrudColumn<T> {
  id?: string // Added ID for unique keys
  key: keyof T | string // Allow string for nested keys
  label: string
  render?: (item: T) => React.ReactNode
}

interface CrudTableProps<T extends { id: string }> {
  title: string
  items: T[]
  columns: CrudColumn<T>[]
  onCreate: () => void
  onEdit: (item: T) => void
  onDelete: (item: T) => void
}

export function CrudTable<T extends { id: string }>({
  title, items, columns, onCreate, onEdit, onDelete,
}: CrudTableProps<T>) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Button onClick={onCreate} className="bg-pitch hover:bg-pitch-dark">
          <Plus className="mr-2 h-4 w-4" /> Add new
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, idx) => (
              // Use col.id or col.label or index to ensure uniqueness
              <TableHead key={col.id || String(col.key) || idx}>{col.label}</TableHead>
            ))}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              {columns.map((col, idx) => (
                <TableCell key={`${item.id}-${col.id || String(col.key) || idx}`}>
                  {col.render ? col.render(item) : String((item as any)[col.key] ?? "")}
                </TableCell>
              ))}
              <TableCell className="text-right space-x-2">
                <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(item)}>
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}