"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { X, Copy, Check, QrCode } from "lucide-react";
import { useT } from "@/lib/i18n";

interface QRCodeDialogProps {
  open: boolean;
  onClose: () => void;
  sheetId: string;
}

function generateQRMatrix(data: string): boolean[][] {
  // Simple QR-like pattern generator for visual representation
  // For production, use a library like qrcode
  const size = 25;
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Fixed patterns (finder patterns)
  const drawFinder = (x: number, y: number) => {
    for (let i = 0; i < 7; i++)
      for (let j = 0; j < 7; j++) {
        matrix[y + i][x + j] =
          i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4);
      }
  };
  drawFinder(0, 0);
  drawFinder(size - 7, 0);
  drawFinder(0, size - 7);

  // Data encoding - hash the input to create a pseudo-random but deterministic pattern
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash + data.charCodeAt(i)) | 0;
  }
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      if (matrix[y][x]) continue;
      if ((x < 8 && y < 8) || (x >= size - 8 && y < 8) || (x < 8 && y >= size - 8)) continue;
      hash = ((hash << 5) - hash + (x * 31 + y * 17)) | 0;
      matrix[y][x] = (hash & 1) === 0;
    }
  return matrix;
}

export function QRCodeDialog({ open, onClose, sheetId }: QRCodeDialogProps) {
  const t = useT();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const shareUrl = useMemo(
    () => (typeof window !== "undefined" ? `${window.location.origin}/share/sheet/${sheetId}` : ""),
    [sheetId],
  );

  useEffect(() => {
    if (!open || !shareUrl) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const matrix = generateQRMatrix(shareUrl);
    const cellSize = 8;
    const padding = 16;
    const qrSize = matrix.length * cellSize;
    canvas.width = qrSize + padding * 2;
    canvas.height = qrSize + padding * 2;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000000";

    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        if (matrix[y][x]) {
          ctx.fillRect(padding + x * cellSize, padding + y * cellSize, cellSize, cellSize);
        }
      }
    }
  }, [open, sheetId, shareUrl]);

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <QrCode className="h-5 w-5" />
            {t.qrCode}
          </h2>
          <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:bg-accent">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-col items-center gap-4">
          <canvas ref={canvasRef} className="rounded-lg border border-border" />
          <p className="text-center text-sm text-muted-foreground">{t.scanToView}</p>
          <div className="flex w-full items-center gap-2 rounded border border-border bg-muted px-3 py-2">
            <span className="flex-1 truncate text-xs text-muted-foreground">{shareUrl}</span>
            <button
              onClick={handleCopy}
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
