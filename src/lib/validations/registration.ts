import { z } from "zod"

export const registrationSchema = z.object({
  playerName: z.string().min(2, "Name is required"),
  position: z.string().min(2, "Position is required"),
  jerseyNumber: z.coerce.number().optional(), // coerce converts string to integer
  district: z.string().optional(),
  photoUrl: z.string().optional(),
  seasonId: z.string().optional()
})

export type RegistrationInput = z.infer<typeof registrationSchema>