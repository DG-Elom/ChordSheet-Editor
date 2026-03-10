"use client";

import { useState, useCallback } from "react";
import type { Share, SharePermission } from "@/types/database.types";

interface UseShareReturn {
  shares: Share[];
  loading: boolean;
  creating: boolean;
  error: string | null;
  fetchShares: (sheetId: string) => Promise<void>;
  createShare: (
    sheetId: string,
    permission: SharePermission,
    expiresAt?: string,
  ) => Promise<Share | null>;
  deleteShare: (shareId: string) => Promise<void>;
  clearError: () => void;
}

export function useShare(): UseShareReturn {
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const fetchShares = useCallback(async (sheetId: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/share?sheet_id=${encodeURIComponent(sheetId)}`);
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: "Failed to fetch shares" }));
        throw new Error(errBody.error || "Failed to fetch shares");
      }
      const data: Share[] = await res.json();
      setShares(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch shares";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createShare = useCallback(
    async (
      sheetId: string,
      permission: SharePermission,
      expiresAt?: string,
    ): Promise<Share | null> => {
      setCreating(true);
      setError(null);

      try {
        const res = await fetch("/api/share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sheet_id: sheetId,
            permission,
            ...(expiresAt ? { expires_at: expiresAt } : {}),
          }),
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({ error: "Failed to create share" }));
          throw new Error(errBody.error || "Failed to create share");
        }

        const share: Share = await res.json();

        // Append the new share to the local list
        setShares((prev) => [share, ...prev]);

        return share;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create share";
        setError(message);
        return null;
      } finally {
        setCreating(false);
      }
    },
    [],
  );

  const deleteShare = useCallback(async (shareId: string) => {
    setError(null);

    try {
      const res = await fetch(`/api/share?id=${encodeURIComponent(shareId)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: "Failed to delete share" }));
        throw new Error(errBody.error || "Failed to delete share");
      }

      // Remove from local list
      setShares((prev) => prev.filter((s) => s.id !== shareId));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete share";
      setError(message);
    }
  }, []);

  return {
    shares,
    loading,
    creating,
    error,
    fetchShares,
    createShare,
    deleteShare,
    clearError,
  };
}
