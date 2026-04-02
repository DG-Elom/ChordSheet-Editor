import { describe, it, expect } from "vitest";
import { createSheetSchema, updateSheetSchema } from "@/lib/validators/sheet-schema";

describe("createSheetSchema", () => {
  describe("valid inputs", () => {
    it("should validate a minimal sheet with just title", () => {
      const result = createSheetSchema.safeParse({ title: "My Song" });
      expect(result.success).toBe(true);
    });

    it("should validate a full sheet", () => {
      const result = createSheetSchema.safeParse({
        title: "Amazing Grace",
        artist: "John Newton",
        song_key: "G",
        tempo: "Moderato",
        bpm: 120,
        time_signature: "3/4",
        youtube_url: "https://youtube.com/watch?v=abc123",
      });
      expect(result.success).toBe(true);
    });

    it("should apply default title", () => {
      const result = createSheetSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("Untitled");
      }
    });

    it("should apply default time signature", () => {
      const result = createSheetSchema.safeParse({ title: "Test" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.time_signature).toBe("4/4");
      }
    });

    it("should accept empty string for youtube_url", () => {
      const result = createSheetSchema.safeParse({
        title: "Test",
        youtube_url: "",
      });
      expect(result.success).toBe(true);
    });

    it("should accept bpm at boundary values", () => {
      expect(createSheetSchema.safeParse({ title: "T", bpm: 1 }).success).toBe(true);
      expect(createSheetSchema.safeParse({ title: "T", bpm: 399 }).success).toBe(true);
    });
  });

  describe("invalid inputs", () => {
    it("should reject empty title", () => {
      const result = createSheetSchema.safeParse({ title: "" });
      expect(result.success).toBe(false);
    });

    it("should reject title exceeding 200 chars", () => {
      const result = createSheetSchema.safeParse({ title: "x".repeat(201) });
      expect(result.success).toBe(false);
    });

    it("should reject artist exceeding 200 chars", () => {
      const result = createSheetSchema.safeParse({
        title: "Test",
        artist: "x".repeat(201),
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid youtube_url", () => {
      const result = createSheetSchema.safeParse({
        title: "Test",
        youtube_url: "not-a-url",
      });
      expect(result.success).toBe(false);
    });

    it("should reject bpm below 1", () => {
      const result = createSheetSchema.safeParse({ title: "T", bpm: 0 });
      expect(result.success).toBe(false);
    });

    it("should reject bpm above 399", () => {
      const result = createSheetSchema.safeParse({ title: "T", bpm: 400 });
      expect(result.success).toBe(false);
    });

    it("should reject non-integer bpm", () => {
      const result = createSheetSchema.safeParse({ title: "T", bpm: 120.5 });
      expect(result.success).toBe(false);
    });

    it("should reject song_key exceeding 10 chars", () => {
      const result = createSheetSchema.safeParse({
        title: "T",
        song_key: "x".repeat(11),
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("updateSheetSchema", () => {
  describe("valid inputs", () => {
    it("should validate empty object (all fields optional)", () => {
      const result = updateSheetSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should validate partial update with just title", () => {
      const result = updateSheetSchema.safeParse({ title: "New Title" });
      expect(result.success).toBe(true);
    });

    it("should validate is_public field", () => {
      const result = updateSheetSchema.safeParse({ is_public: true });
      expect(result.success).toBe(true);
    });

    it("should validate is_archived field", () => {
      const result = updateSheetSchema.safeParse({ is_archived: true });
      expect(result.success).toBe(true);
    });

    it("should validate combined update", () => {
      const result = updateSheetSchema.safeParse({
        title: "Updated Title",
        bpm: 140,
        is_public: false,
        is_archived: false,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("invalid inputs", () => {
    it("should reject invalid bpm in update", () => {
      const result = updateSheetSchema.safeParse({ bpm: 500 });
      expect(result.success).toBe(false);
    });

    it("should reject invalid youtube_url in update", () => {
      const result = updateSheetSchema.safeParse({ youtube_url: "bad-url" });
      expect(result.success).toBe(false);
    });
  });
});
