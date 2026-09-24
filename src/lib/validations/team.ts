import { z } from "zod";

export const teamSchema = z.object({
  name: z.string().min(2, "Team name is required"),
  logoUrl: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  founded: z.coerce.number().int().optional().nullable(),
  ownerName: z.string().optional().nullable(),
  ownerPhoto: z.string().optional().nullable(),
  ownerBio: z.string().optional().nullable(), // NEW
  mentorName: z.string().optional().nullable(),
  mentorPhoto: z.string().optional().nullable(),
  mentorBio: z.string().optional().nullable(), // NEW
  description: z.string().optional().nullable(),
  titlesWon: z.coerce.number().int().optional().nullable(),
  sponsorName: z.string().optional().nullable(),
  sponsorLogo: z.string().optional().nullable(),
  captainId: z.string().optional().nullable(),
  viceCaptainId: z.string().optional().nullable(),
});