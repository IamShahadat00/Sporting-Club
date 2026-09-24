import { z } from "zod"

export const tournamentSchema = z.object({
  name: z.string().min(2),
  status: z.enum(["UPCOMING", "ACTIVE", "COMPLETED"]),
  bannerImageUrl: z.string().optional().nullable(), // Add .nullable()
  startDate: z.string().optional().nullable(),     // Add .nullable()
  endDate: z.string().optional().nullable(),       // Add .nullable()
})
