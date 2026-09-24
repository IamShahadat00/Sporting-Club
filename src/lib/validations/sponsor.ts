import { z } from "zod"

export const sponsorSchema = z.object({
  name: z.string().min(2, "Name is required"),
  // Changed from enum to string to allow "Jersey Sponsor" etc.
  tier: z.string().min(1, "Tier is required"), 
  logoUrl: z.string().optional().nullable(),
  websiteUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  description: z.string().optional().nullable(),
})