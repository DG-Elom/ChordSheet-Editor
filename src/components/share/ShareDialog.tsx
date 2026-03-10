"use client";

import { useState, useEffect } from "react";
import { X, Link2, Copy, Check, Trash2, Loader2, Globe } from "lucide-react";
import { useShare } from "@/lib/hooks/use-share";
import type { SharePermission } from "@/types/database.types";

interface ShareDialogProps {
  sheetId: string;
  open: boolean;
  onClose: () => void;
}

export function ShareDialog({ sheetId, open, onClose }: ShareDialogProps) {
  const { shares, loading, creating, error, fetchShares, createShare, deleteShare } = useShare();

  const [permission, setPermission] = useState<SharePermission>("read");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchShares(sheetId);
    }
  }, [open, sheetId, fetchShares]);

  if (!open) return null;

  const handleCreateShare = async () => {
    await createShare(sheetId, permission);
  };

  const handleCopy = async (token: string) => {
    const url = `${window.location.origin}/share/${token}`;
    await navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleDelete = async (shareId: string) => {
    await deleteShare(shareId);
    fetchShares(sheetId);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-card-foreground">Share Sheet</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Generate new link section */}
          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-3 text-sm font-medium text-card-foreground">Generate Share Link</h3>

            {/* Permission selector */}
            <div className="mb-3">
              <label className="mb-1.5 block text-xs text-muted-foreground">Permission</label>
              <div className="flex gap-2">
                {(
                  [
                    { value: "read", label: "Read" },
                    { value: "comment", label: "Comment" },
                    { value: "edit", label: "Edit" },
                  ] as const
                ).map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setPermission(value)}
                    className={`flex-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                      permission === value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreateShare}
              disabled={creating}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4" />
                  Generate Link
                </>
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Existing shares */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-card-foreground">Active Share Links</h3>

            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : shares.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No active share links yet.
              </p>
            ) : (
              <div className="space-y-2">
                {shares.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5"
                  >
                    <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-mono text-xs text-muted-foreground">
                          /share/{share.token.slice(0, 12)}...
                        </span>
                        <span
                          className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${
                            share.permission === "edit"
                              ? "bg-orange-500/10 text-orange-500"
                              : share.permission === "comment"
                                ? "bg-green-500/10 text-green-500"
                                : "bg-blue-500/10 text-blue-500"
                          }`}
                        >
                          {share.permission}
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        Created {formatDate(share.created_at)}
                        {share.expires_at && (
                          <span className="ml-2">Expires {formatDate(share.expires_at)}</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopy(share.token)}
                      className="shrink-0 rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                      title="Copy link"
                    >
                      {copiedToken === share.token ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(share.id)}
                      className="shrink-0 rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      title="Delete share link"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
