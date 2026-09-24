export type FieldType = "text" | "textarea" | "number" | "select" | "image" | "date"

export interface CrudField {
  name: string
  label: string
  type: FieldType
  placeholder?: string
  options?: { label: string; value: string }[]  // for "select"
  bucket?: "player-photos" | "banners"           // for "image"
  required?: boolean
}