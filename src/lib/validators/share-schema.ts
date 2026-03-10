import { z } from "zod";

export const createShareSchema = z.object({
  sheet_id: z.string().uuid(),
  permission: z.enum(["read", "comment", "edit"]).default("read"),
  expires_at: z.string().datetime().optional(),
});

export type CreateShareInput = z.infer<typeof createShareSchema>;
