import { z } from "zod";

/**
 * Used when scheduling a new match or editing match details
 */
export const matchSchema = z
  .object({
    matchNumber: z.coerce.number().optional().nullable(),
    seasonId: z.string().min(1, "Season is required"),
    homeTeamId: z.string().min(1, "Home team is required"),
    awayTeamId: z.string().min(1, "Away team is required"),
    scheduledStart: z.string().min(1, "Kickoff time is required"),
    venue: z.string().optional().nullable(),
    broadcastUrl: z.string().optional().nullable(),
    status: z.enum(["SCHEDULED", "LIVE", "FINISHED", "POSTPONED"]).optional(),
  })
  .refine((data) => data.homeTeamId !== data.awayTeamId, {
    message: "Home and away team must be different",
    path: ["awayTeamId"],
  });

/**
 * Used for LIVE updates (scores/cards) and FINALizing the match report
 */
export const matchReportSchema = z.object({
  action: z.enum(["score", "finalize"]),
  homeScore: z.coerce.number().int().min(0),
  awayScore: z.coerce.number().int().min(0),
  events: z.array(z.any()).optional().nullable(),
  report: z.string().optional().nullable(),
  highlightsUrl: z.string().optional().nullable(),
  highlightsTitle: z.string().optional().nullable(),
  mvpPlayerId: z.string().optional().nullable(),
  mvpCitation: z.string().optional().nullable(),
  mvpPhotoUrl: z.string().optional().nullable(),
  isPenalty: z.boolean().optional(),
  homePens: z.coerce.number().optional(),
  awayPens: z.coerce.number().optional(),
});

export type MatchInput = z.infer<typeof matchSchema>;
export type MatchReportInput = z.infer<typeof matchReportSchema>;