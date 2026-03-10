import { z } from "zod";

const sectionTypeEnum = z.enum([
  "verse",
  "chorus",
  "bridge",
  "pre_chorus",
  "intro",
  "outro",
  "interlude",
  "tag",
  "custom",
]);

export const createSectionSchema = z.object({
  sheet_id: z.string().uuid(),
  type: sectionTypeEnum.default("verse"),
  label: z.string().max(100).optional(),
  sort_order: z.number().int().min(0).default(0),
  content: z.record(z.string(), z.unknown()).default({}),
  reference_section_id: z.string().uuid().optional(),
});

export const updateSectionSchema = z.object({
  type: sectionTypeEnum.optional(),
  label: z.string().max(100).optional(),
  sort_order: z.number().int().min(0).optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  is_collapsed: z.boolean().optional(),
});

export const reorderSectionsSchema = z.object({
  section_ids: z.array(z.string().uuid()),
});

export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;
