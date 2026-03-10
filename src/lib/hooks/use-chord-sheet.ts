"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ChordSheet } from "@/types/database.types";
import type { CreateSheetInput, UpdateSheetInput } from "@/lib/validators/sheet-schema";

async function fetchSheets(): Promise<ChordSheet[]> {
  const res = await fetch("/api/sheets");
  if (!res.ok) throw new Error("Failed to fetch sheets");
  return res.json();
}

async function fetchSheet(id: string): Promise<ChordSheet> {
  const res = await fetch(`/api/sheets/${id}`);
  if (!res.ok) throw new Error("Failed to fetch sheet");
  return res.json();
}

async function createSheet(input: CreateSheetInput): Promise<ChordSheet> {
  const res = await fetch("/api/sheets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create sheet");
  return res.json();
}

async function updateSheet({
  id,
  data,
}: {
  id: string;
  data: UpdateSheetInput;
}): Promise<ChordSheet> {
  const res = await fetch(`/api/sheets/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update sheet");
  return res.json();
}

async function deleteSheet(id: string): Promise<void> {
  const res = await fetch(`/api/sheets/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete sheet");
}

export function useSheets() {
  return useQuery({
    queryKey: ["sheets"],
    queryFn: fetchSheets,
  });
}

export function useSheet(id: string) {
  return useQuery({
    queryKey: ["sheets", id],
    queryFn: () => fetchSheet(id),
    enabled: !!id,
  });
}

export function useCreateSheet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSheet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sheets"] });
    },
  });
}

export function useUpdateSheet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSheet,
    onSuccess: (data) => {
      queryClient.setQueryData(["sheets", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["sheets"] });
    },
  });
}

export function useDeleteSheet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSheet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sheets"] });
    },
  });
}
