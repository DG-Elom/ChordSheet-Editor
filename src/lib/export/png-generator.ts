import type { ExportOptions } from "@/types/editor.types";

interface PngExportData {
  title: string;
  artist?: string;
  songKey?: string;
  sections: { label: string; lines: string[] }[];
}

export async function generatePng(data: PngExportData, options: ExportOptions): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const fontSizeMap = { compact: 12, standard: 14, readable: 18 };
  const baseFontSize = fontSizeMap[options.fontPreset ?? "standard"];
  const padding = 40;
  const lineHeight = baseFontSize * 1.6;
  const sectionGap = baseFontSize * 2;

  // Calculate dimensions
  let totalHeight = padding * 2;
  totalHeight += baseFontSize * 2; // Title
  if (data.artist) totalHeight += baseFontSize * 1.5;
  if (data.songKey) totalHeight += baseFontSize * 1.2;
  totalHeight += sectionGap;

  for (const section of data.sections) {
    totalHeight += baseFontSize * 1.5; // Section label
    totalHeight += section.lines.length * lineHeight;
    totalHeight += sectionGap;
  }

  const width = options.columns === 2 ? 1200 : 800;
  canvas.width = width;
  canvas.height = Math.max(totalHeight, 200);

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let y = padding;

  // Title
  ctx.fillStyle = "#111111";
  ctx.font = `bold ${baseFontSize * 1.6}px "Courier New", monospace`;
  ctx.fillText(data.title || "Untitled", padding, y + baseFontSize * 1.6);
  y += baseFontSize * 2.2;

  // Artist
  if (data.artist) {
    ctx.fillStyle = "#666666";
    ctx.font = `${baseFontSize * 1.1}px "Courier New", monospace`;
    ctx.fillText(data.artist, padding, y);
    y += baseFontSize * 1.5;
  }

  // Key
  if (data.songKey) {
    ctx.fillStyle = "#888888";
    ctx.font = `${baseFontSize * 0.9}px "Courier New", monospace`;
    ctx.fillText(`Key: ${data.songKey}`, padding, y);
    y += baseFontSize * 1.2;
  }

  y += sectionGap * 0.5;

  // Sections
  for (const section of data.sections) {
    // Section label
    ctx.fillStyle = "#3b82f6";
    ctx.font = `bold ${baseFontSize}px "Courier New", monospace`;
    ctx.fillText(`[${section.label}]`, padding, y);
    y += baseFontSize * 1.5;

    // Lines
    ctx.fillStyle = "#111111";
    ctx.font = `${baseFontSize}px "Courier New", monospace`;
    for (const line of section.lines) {
      // Check if line looks like a chord line (contains chord-like patterns)
      const isChordLine = /^[\s]*([A-G][#b]?(?:m|maj|min|dim|aug|sus|add|7|9|11|13)*[\s]*)+$/.test(
        line,
      );
      if (isChordLine) {
        ctx.fillStyle = "#3b82f6";
        ctx.font = `bold ${baseFontSize}px "Courier New", monospace`;
      } else {
        ctx.fillStyle = "#111111";
        ctx.font = `${baseFontSize}px "Courier New", monospace`;
      }
      ctx.fillText(line, padding, y);
      y += lineHeight;
    }
    y += sectionGap * 0.5;
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
}
