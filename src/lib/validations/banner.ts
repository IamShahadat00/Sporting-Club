import { z } from "zod"

export const bannerSchema = z.object({
  imageUrl: z.string().min(1),
  linkUrl: z.string().optional(),
  startAt: z.string(),
  endAt: z.string(),
  isActive: z.boolean().optional()
})