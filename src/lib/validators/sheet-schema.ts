import { z } from "zod";

export const createSheetSchema = z.object({
  title: z.string().min(1).max(200).default("Untitled"),
  artist: z.string().max(200).optional(),
  song_key: z.string().max(10).optional(),
  tempo: z.string().max(50).optional(),
  bpm: z.number().int().min(1).max(399).optional(),
  time_signature: z.string().max(10).default("4/4"),
  youtube_url: z.string().url().optional().or(z.literal("")),
});

export const updateSheetSchema = createSheetSchema.partial().extend({
  is_public: z.boolean().optional(),
  is_archived: z.boolean().optional(),
});

export type CreateSheetInput = z.infer<typeof createSheetSchema>;
export type UpdateSheetInput = z.infer<typeof updateSheetSchema>;
