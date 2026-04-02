import { describe, it, expect } from "vitest";
import {
  createSectionSchema,
  updateSectionSchema,
  reorderSectionsSchema,
} from "@/lib/validators/section-schema";

describe("createSectionSchema", () => {
  describe("valid inputs", () => {
    it("should validate a minimal section with sheet_id", () => {
      const result = createSectionSchema.safeParse({
        sheet_id: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });

    it("should validate a full section", () => {
      const result = createSectionSchema.safeParse({
        sheet_id: "550e8400-e29b-41d4-a716-446655440000",
        type: "chorus",
        label: "Chorus 1",
        sort_order: 2,
        content: { text: "hello" },
        reference_section_id: "660e8400-e29b-41d4-a716-446655440001",
      });
      expect(result.success).toBe(true);
    });

    it("should apply default type as verse", () => {
      const result = createSectionSchema.safeParse({
        sheet_id: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("verse");
      }
    });

    it("should apply default sort_order as 0", () => {
      const result = createSectionSchema.safeParse({
        sheet_id: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sort_order).toBe(0);
      }
    });

    it("should accept all valid section types", () => {
      const types = [
        "verse",
        "chorus",
        "bridge",
        "pre_chorus",
        "intro",
        "outro",
        "interlude",
        "tag",
        "custom",
      ];
      for (const type of types) {
        const result = createSectionSchema.safeParse({
          sheet_id: "550e8400-e29b-41d4-a716-446655440000",
          type,
        });
        expect(result.success).toBe(true);
      }
    });
  });

  describe("invalid inputs", () => {
    it("should reject missing sheet_id", () => {
      const result = createSectionSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("should reject non-UUID sheet_id", () => {
      const result = createSectionSchema.safeParse({ sheet_id: "not-a-uuid" });
      expect(result.success).toBe(false);
    });

    it("should reject invalid section type", () => {
      const result = createSectionSchema.safeParse({
        sheet_id: "550e8400-e29b-41d4-a716-446655440000",
        type: "invalid_type",
      });
      expect(result.success).toBe(false);
    });

    it("should reject label exceeding 100 chars", () => {
      const result = createSectionSchema.safeParse({
        sheet_id: "550e8400-e29b-41d4-a716-446655440000",
        label: "x".repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it("should reject negative sort_order", () => {
      const result = createSectionSchema.safeParse({
        sheet_id: "550e8400-e29b-41d4-a716-446655440000",
        sort_order: -1,
      });
      expect(result.success).toBe(false);
    });

    it("should reject non-UUID reference_section_id", () => {
      const result = createSectionSchema.safeParse({
        sheet_id: "550e8400-e29b-41d4-a716-446655440000",
        reference_section_id: "not-a-uuid",
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("updateSectionSchema", () => {
  describe("valid inputs", () => {
    it("should validate empty object", () => {
      const result = updateSectionSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should validate partial update", () => {
      const result = updateSectionSchema.safeParse({
        type: "bridge",
        label: "Bridge 2",
      });
      expect(result.success).toBe(true);
    });

    it("should validate is_collapsed field", () => {
      const result = updateSectionSchema.safeParse({ is_collapsed: true });
      expect(result.success).toBe(true);
    });

    it("should validate content update", () => {
      const result = updateSectionSchema.safeParse({
        content: { text: "updated content", chords: [] },
      });
      expect(result.success).toBe(true);
    });
  });

  describe("invalid inputs", () => {
    it("should reject invalid type", () => {
      const result = updateSectionSchema.safeParse({ type: "bad_type" });
      expect(result.success).toBe(false);
    });

    it("should reject label exceeding 100 chars", () => {
      const result = updateSectionSchema.safeParse({ label: "x".repeat(101) });
      expect(result.success).toBe(false);
    });

    it("should reject negative sort_order", () => {
      const result = updateSectionSchema.safeParse({ sort_order: -1 });
      expect(result.success).toBe(false);
    });
  });
});

describe("reorderSectionsSchema", () => {
  describe("valid inputs", () => {
    it("should validate array of UUIDs", () => {
      const result = reorderSectionsSchema.safeParse({
        section_ids: [
          "550e8400-e29b-41d4-a716-446655440000",
          "660e8400-e29b-41d4-a716-446655440001",
        ],
      });
      expect(result.success).toBe(true);
    });

    it("should validate empty array", () => {
      const result = reorderSectionsSchema.safeParse({ section_ids: [] });
      expect(result.success).toBe(true);
    });
  });

  describe("invalid inputs", () => {
    it("should reject non-UUID strings", () => {
      const result = reorderSectionsSchema.safeParse({
        section_ids: ["not-a-uuid"],
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing section_ids", () => {
      const result = reorderSectionsSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
