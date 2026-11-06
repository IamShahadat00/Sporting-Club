import { z } from "zod";

export const playerSchema = z.object({
  name: z.string().min(2, "Player name is required"),
  position: z.string().optional().nullable(),
  jerseyNumber: z.coerce.number().optional().nullable(),
  teamId: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  strongFoot: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
});

export type PlayerInput = z.infer<typeof playerSchema>;
