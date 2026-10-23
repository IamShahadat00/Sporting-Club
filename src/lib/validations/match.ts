import { z } from "zod";

/**
 * Used when scheduling a new match or editing basic details
 */
export const matchSchema = z
  .object({
    seasonId: z.string().min(1, "Season is required"),
    homeTeamId: z.string().min(1, "Home team is required"),
    awayTeamId: z.string().min(1, "Away team is required"),
    scheduledStart: z.string().min(1, "Kickoff time is required"),
    venue: z.string().optional().nullable(),
  })
  .refine((data) => data.homeTeamId !== data.awayTeamId, {
    message: "Home and away team must be different",
    path: ["awayTeamId"],
  });

/**
 * Used for LIVE updates (scores/cards) and FINALizing the match report
 */
export const matchReportSchema = z.object({
  // Tells the API whether to just save the score or mark the match as FINISHED
  action: z.enum(["score", "finalize"]),

  // Scores (z.coerce ensures that strings like "1" are converted to numbers)
  homeScore: z.coerce.number().int().min(0),
  awayScore: z.coerce.number().int().min(0),

  // The list of goals, yellow cards, red cards, etc.
  events: z.array(z.any()).optional().nullable(),

  // Report details - made optional/nullable to avoid 400 errors during quick updates
  report: z.string().optional().nullable(),

  // MVP Details
  mvpPlayerId: z.string().optional().nullable(),
  mvpCitation: z.string().optional().nullable(),
  mvpPhotoUrl: z.string().optional().nullable(),
});

export type MatchInput = z.infer<typeof matchSchema>;
export type MatchReportInput = z.infer<typeof matchReportSchema>;
