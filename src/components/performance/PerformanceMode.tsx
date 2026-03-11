"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, X, Minus, Plus, ChevronUp, ChevronDown } from "lucide-react";
import { usePerformanceStore } from "@/lib/store/performance-store";
import { useEditorStore } from "@/lib/store/editor-store";
import { useT } from "@/lib/i18n";

export function PerformanceMode() {
  const { isActive, scrollSpeed, fontSize, setActive, setScrollSpeed, setFontSize } =
    usePerformanceStore();
  const { sheet, editorContent } = useEditorStore();
  const t = useT();
  const [isPlaying, setIsPlaying] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isActive) return;
    lastTimeRef.current = 0;

    function tick(timestamp: number) {
      if (!scrollRef.current) return;
      if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      if (isPlaying) {
        scrollRef.current.scrollTop += (scrollSpeed / 60) * (delta / 16.67);
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 10) {
          setIsPlaying(false);
          return;
        }
      }
      animationRef.current = requestAnimationFrame(tick);
    }

    animationRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isActive, isPlaying, scrollSpeed]);

  useEffect(() => {
    if (!isActive) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case " ":
          e.preventDefault();
          setIsPlaying((p) => !p);
          break;
        case "Escape":
          setActive(false);
          setIsPlaying(false);
          break;
        case "ArrowUp":
          e.preventDefault();
          setScrollSpeed(Math.max(5, scrollSpeed - 5));
          break;
        case "ArrowDown":
          e.preventDefault();
          setScrollSpeed(Math.min(100, scrollSpeed + 5));
          break;
        case "+":
        case "=":
          setFontSize(Math.min(3, fontSize + 0.1));
          break;
        case "-":
          setFontSize(Math.max(0.5, fontSize - 0.1));
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, scrollSpeed, fontSize, setActive, setScrollSpeed, setFontSize]);

  if (!isActive) return null;

  const sectionColors: Record<string, string> = {
    verse: "#3b82f6",
    chorus: "#f97316",
    bridge: "#8b5cf6",
    pre_chorus: "#22c55e",
    intro: "#6b7280",
    outro: "#6b7280",
    interlude: "#eab308",
    tag: "#ef4444",
    custom: "#a855f7",
  };

  const qualityDisplay: Record<string, string> = {
    maj: "",
    min: "m",
    "7": "7",
    maj7: "maj7",
    min7: "m7",
    dim: "dim",
    aug: "aug",
    sus2: "sus2",
    sus4: "sus4",
    dim7: "dim7",
    m7b5: "m7b5",
    "6": "6",
    m6: "m6",
    "9": "9",
    "11": "11",
    "13": "13",
    aug7: "aug7",
    maj9: "maj9",
    min9: "m9",
    "7sus4": "7sus4",
    add9: "add9",
    "m(maj7)": "m(maj7)",
    "5": "5",
  };

  const renderContent = () => {
    if (!editorContent?.content) return null;
    return editorContent.content.map((node, idx) => {
      if (node.type !== "sectionNode") return null;
      const sectionType = (node.attrs?.sectionType as string) || "verse";
      const label = (node.attrs?.label as string) || sectionType;

      return (
        <div key={idx} className="mb-8">
          <div
            className="mb-3 inline-block rounded px-3 py-1 text-sm font-bold uppercase tracking-wider text-white"
            style={{ backgroundColor: sectionColors[sectionType] || "#6b7280" }}
          >
            {label}
          </div>
          <div className="space-y-1">
            {node.content?.map((paragraph, pIdx) => {
              if (paragraph.type !== "paragraph") return null;
              if (!paragraph.content) return <div key={pIdx} className="h-4" />;

              const chords: { text: string; pos: number }[] = [];
              let fullText = "";
              let charPos = 0;

              for (const inline of paragraph.content) {
                const text = (inline.text as string) || "";
                const marks = inline.marks as
                  | Array<{ type: string; attrs?: Record<string, string> }>
                  | undefined;
                if (marks?.some((m) => m.type === "chordMark")) {
                  const mark = marks.find((m) => m.type === "chordMark");
                  if (mark?.attrs) {
                    const q = qualityDisplay[mark.attrs.quality] ?? mark.attrs.quality;
                    let chordText = mark.attrs.root + q;
                    if (mark.attrs.bass) chordText += "/" + mark.attrs.bass;
                    chords.push({ text: chordText, pos: charPos });
                  }
                }
                fullText += text;
                charPos += text.length;
              }

              let chordLine = "";
              let lastEnd = 0;
              for (const chord of chords) {
                chordLine += " ".repeat(Math.max(0, chord.pos - lastEnd)) + chord.text;
                lastEnd = chord.pos + chord.text.length;
              }

              return (
                <div key={pIdx}>
                  {chordLine.trim() && (
                    <div className="font-bold text-blue-400" style={{ fontFamily: "monospace" }}>
                      {chordLine}
                    </div>
                  )}
                  <div className="text-white" style={{ fontFamily: "monospace" }}>
                    {fullText || "\u00A0"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black">
      <div className="flex items-center justify-between bg-black/80 px-4 py-2 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-2 text-white/70">
            <span className="text-xs">{t.scrollSpeed}</span>
            <button
              onClick={() => setScrollSpeed(Math.max(5, scrollSpeed - 5))}
              className="rounded p-1 hover:bg-white/10"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-8 text-center text-sm font-medium text-white">{scrollSpeed}</span>
            <button
              onClick={() => setScrollSpeed(Math.min(100, scrollSpeed + 5))}
              className="rounded p-1 hover:bg-white/10"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <span className="text-xs">{t.fontSize}</span>
            <button
              onClick={() => setFontSize(Math.max(0.5, fontSize - 0.1))}
              className="rounded p-1 hover:bg-white/10"
            >
              <ChevronDown className="h-3 w-3" />
            </button>
            <span className="w-12 text-center text-sm font-medium text-white">
              {Math.round(fontSize * 100)}%
            </span>
            <button
              onClick={() => setFontSize(Math.min(3, fontSize + 0.1))}
              className="rounded p-1 hover:bg-white/10"
            >
              <ChevronUp className="h-3 w-3" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {sheet && (
            <div className="text-right">
              <div className="text-sm font-medium text-white">{sheet.title}</div>
              {sheet.artist && <div className="text-xs text-white/50">{sheet.artist}</div>}
            </div>
          )}
          <button
            onClick={() => {
              setActive(false);
              setIsPlaying(false);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-red-500/50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-8 py-12"
        style={{ fontSize: `${fontSize}rem` }}
      >
        <div className="mx-auto max-w-3xl">
          {sheet && (
            <div className="mb-12 text-center">
              <h1
                className="text-3xl font-bold text-white"
                style={{ fontSize: `${fontSize * 2}rem` }}
              >
                {sheet.title}
              </h1>
              {sheet.artist && (
                <p
                  className="mt-2 text-lg text-white/60"
                  style={{ fontSize: `${fontSize * 1.2}rem` }}
                >
                  {sheet.artist}
                </p>
              )}
              <div className="mt-3 flex items-center justify-center gap-4 text-sm text-white/40">
                {sheet.song_key && <span>Key: {sheet.song_key}</span>}
                {sheet.bpm && <span>BPM: {sheet.bpm}</span>}
                {sheet.time_signature && <span>{sheet.time_signature}</span>}
              </div>
            </div>
          )}
          {renderContent()}
          <div style={{ height: "80vh" }} />
        </div>
      </div>
    </div>
  );
}
