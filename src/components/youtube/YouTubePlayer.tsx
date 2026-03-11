"use client";

import { useState } from "react";
import { Youtube, Minimize2, Maximize2 } from "lucide-react";
import { useT } from "@/lib/i18n";

interface YouTubePlayerProps {
  url: string;
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function YouTubePlayer({ url }: YouTubePlayerProps) {
  const t = useT();
  const [minimized, setMinimized] = useState(false);
  const videoId = extractVideoId(url);

  if (!videoId) return null;

  return (
    <div className={`rounded-lg border border-border bg-card ${minimized ? "p-2" : "p-4"}`}>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Youtube className="h-4 w-4 text-red-500" />
          {t.youtubePlayer}
        </h3>
        <button
          onClick={() => setMinimized(!minimized)}
          className="text-muted-foreground hover:text-foreground"
        >
          {minimized ? (
            <Maximize2 className="h-3.5 w-3.5" />
          ) : (
            <Minimize2 className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      {!minimized && (
        <div className="aspect-video w-full overflow-hidden rounded">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}?rel=0`}
            title="YouTube player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="border-0"
          />
        </div>
      )}
    </div>
  );
}
