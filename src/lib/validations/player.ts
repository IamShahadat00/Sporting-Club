import { z } from "zod"

export const playerSchema = z.object({
  name: z.string().min(2),
  position: z.string().optional(),
  jerseyNumber: z.coerce.number().optional(),
  district: z.string().optional(),
  teamId: z.string().optional(),
  photoUrl: z.string().optional()
})