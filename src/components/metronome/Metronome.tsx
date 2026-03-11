"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Minus, Plus } from "lucide-react";
import { useT } from "@/lib/i18n";

interface MetronomeProps {
  initialBpm?: number;
  onClose?: () => void;
}

export function Metronome({ initialBpm = 120, onClose }: MetronomeProps) {
  const t = useT();
  const [bpm, setBpm] = useState(initialBpm);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const tapTimesRef = useRef<number[]>([]);

  const playClick = useCallback((isAccent: boolean) => {
    if (!audioContextRef.current) audioContextRef.current = new AudioContext();
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = isAccent ? 1000 : 800;
    gain.gain.value = isAccent ? 0.3 : 0.15;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      let beat = 0;
      const tick = () => {
        playClick(beat % beatsPerMeasure === 0);
        setCurrentBeat(beat % beatsPerMeasure);
        beat++;
      };
      tick();
      intervalRef.current = setInterval(tick, 60000 / bpm);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setCurrentBeat(0);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, bpm, beatsPerMeasure, playClick]);

  const handleTapTempo = () => {
    const now = Date.now();
    tapTimesRef.current.push(now);
    if (tapTimesRef.current.length > 5) tapTimesRef.current = tapTimesRef.current.slice(-5);
    if (tapTimesRef.current.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < tapTimesRef.current.length; i++)
        intervals.push(tapTimesRef.current[i] - tapTimesRef.current[i - 1]);
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const tapped = Math.round(60000 / avg);
      if (tapped >= 20 && tapped <= 300) setBpm(tapped);
    }
    setTimeout(() => {
      if (Date.now() - tapTimesRef.current[tapTimesRef.current.length - 1] > 2000)
        tapTimesRef.current = [];
    }, 2100);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{t.metronome}</h3>
        {onClose && (
          <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">
            {t.close}
          </button>
        )}
      </div>
      <div className="mb-4 flex items-center justify-center gap-4">
        <button
          onClick={() => setBpm(Math.max(20, bpm - 1))}
          className="rounded-full p-2 text-muted-foreground hover:bg-accent"
        >
          <Minus className="h-4 w-4" />
        </button>
        <div className="text-center">
          <span className="text-3xl font-bold text-foreground">{bpm}</span>
          <span className="ml-1 text-sm text-muted-foreground">BPM</span>
        </div>
        <button
          onClick={() => setBpm(Math.min(300, bpm + 1))}
          className="rounded-full p-2 text-muted-foreground hover:bg-accent"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <input
        type="range"
        min="20"
        max="300"
        value={bpm}
        onChange={(e) => setBpm(Number(e.target.value))}
        className="mb-4 w-full accent-primary"
      />
      <div className="mb-4 flex justify-center gap-2">
        {Array.from({ length: beatsPerMeasure }).map((_, i) => (
          <div
            key={i}
            className={`h-4 w-4 rounded-full transition-all ${isPlaying && currentBeat === i ? (i === 0 ? "scale-125 bg-primary" : "scale-110 bg-primary/60") : "bg-muted"}`}
          />
        ))}
      </div>
      <div className="mb-4 flex items-center justify-center gap-2">
        <span className="text-xs text-muted-foreground">{t.beatsPerMeasure}:</span>
        {[2, 3, 4, 6].map((beats) => (
          <button
            key={beats}
            onClick={() => setBeatsPerMeasure(beats)}
            className={`rounded px-2 py-1 text-xs font-medium ${beatsPerMeasure === beats ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
          >
            {beats}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isPlaying ? t.stopMetronome : t.startMetronome}
        </button>
        <button
          onClick={handleTapTempo}
          className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-muted"
        >
          {t.tapTempo}
        </button>
      </div>
    </div>
  );
}
