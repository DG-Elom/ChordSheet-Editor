"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Section } from "@/types/database.types";
import type { CreateSectionInput, UpdateSectionInput } from "@/lib/validators/section-schema";

async function fetchSections(sheetId: string): Promise<Section[]> {
  const res = await fetch(`/api/sheets/${sheetId}/sections`);
  if (!res.ok) throw new Error("Failed to fetch sections");
  return res.json();
}

async function createSection(input: CreateSectionInput): Promise<Section> {
  const res = await fetch(`/api/sheets/${input.sheet_id}/sections`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create section");
  return res.json();
}

async function updateSection({
  sheetId,
  sectionId,
  data,
}: {
  sheetId: string;
  sectionId: string;
  data: UpdateSectionInput;
}): Promise<Section> {
  const res = await fetch(`/api/sheets/${sheetId}/sections/${sectionId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update section");
  return res.json();
}

async function reorderSections({
  sheetId,
  sectionIds,
}: {
  sheetId: string;
  sectionIds: string[];
}): Promise<void> {
  const res = await fetch(`/api/sheets/${sheetId}/sections`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ section_ids: sectionIds }),
  });
  if (!res.ok) throw new Error("Failed to reorder sections");
}

export function useSections(sheetId: string) {
  return useQuery({
    queryKey: ["sections", sheetId],
    queryFn: () => fetchSections(sheetId),
    enabled: !!sheetId,
  });
}

export function useCreateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSection,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sections", data.sheet_id] });
    },
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSection,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sections", variables.sheetId] });
    },
  });
}

export function useReorderSections() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reorderSections,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sections", variables.sheetId] });
    },
  });
}
