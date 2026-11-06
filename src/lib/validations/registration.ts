import { z } from "zod";

export const registrationSchema = z.object({
  playerName: z.string().min(2, "Player name is required"),
  position: z.string().min(2, "Position is required"),
  jerseyNumber: z.coerce.number().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  seasonId: z.string().optional().nullable(),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;