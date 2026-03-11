"use client";

import { getChordDiagram } from "@/lib/chord-engine/diagrams";
import type { ChordDiagram as ChordDiagramData, PianoChordData } from "@/lib/chord-engine/diagrams";
import type { InstrumentType } from "@/types/database.types";

interface ChordDiagramProps {
  root: string;
  quality: string;
  instrument: InstrumentType;
  size?: number;
}

function GuitarDiagram({ diagram, size = 80 }: { diagram: ChordDiagramData; size: number }) {
  const strings = diagram.positions.length;
  const frets = 4;
  const stringSpacing = size / (strings - 1);
  const fretSpacing = (size * 1.2) / frets;
  const topPadding = 20;
  const leftPadding = 15;
  const width = leftPadding + stringSpacing * (strings - 1) + 15;
  const height = topPadding + fretSpacing * frets + 15;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {diagram.baseFret === 1 ? (
        <rect
          x={leftPadding - 1}
          y={topPadding - 2}
          width={stringSpacing * (strings - 1) + 2}
          height={3}
          fill="currentColor"
        />
      ) : (
        <text
          x={leftPadding - 12}
          y={topPadding + fretSpacing / 2 + 4}
          fontSize="10"
          fill="currentColor"
          textAnchor="middle"
        >
          {diagram.baseFret}
        </text>
      )}
      {Array.from({ length: frets + 1 }).map((_, i) => (
        <line
          key={`f-${i}`}
          x1={leftPadding}
          y1={topPadding + i * fretSpacing}
          x2={leftPadding + stringSpacing * (strings - 1)}
          y2={topPadding + i * fretSpacing}
          stroke="currentColor"
          strokeWidth={0.5}
          opacity={0.3}
        />
      ))}
      {Array.from({ length: strings }).map((_, i) => (
        <line
          key={`s-${i}`}
          x1={leftPadding + i * stringSpacing}
          y1={topPadding}
          x2={leftPadding + i * stringSpacing}
          y2={topPadding + frets * fretSpacing}
          stroke="currentColor"
          strokeWidth={0.5}
          opacity={0.5}
        />
      ))}
      {diagram.barres.map((barre, i) => (
        <rect
          key={`b-${i}`}
          x={leftPadding + barre.from * stringSpacing - 3}
          y={topPadding + (barre.fret - diagram.baseFret + 0.5) * fretSpacing - 5}
          width={(barre.to - barre.from) * stringSpacing + 6}
          height={10}
          rx={5}
          fill="currentColor"
          opacity={0.8}
        />
      ))}
      {diagram.positions.map((fret, si) => {
        const x = leftPadding + si * stringSpacing;
        if (fret === -1)
          return (
            <text
              key={si}
              x={x}
              y={topPadding - 6}
              fontSize="10"
              fill="currentColor"
              textAnchor="middle"
            >
              x
            </text>
          );
        if (fret === 0)
          return (
            <circle
              key={si}
              cx={x}
              cy={topPadding - 7}
              r={3.5}
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
            />
          );
        return (
          <circle
            key={si}
            cx={x}
            cy={topPadding + (fret - diagram.baseFret + 0.5) * fretSpacing}
            r={4.5}
            fill="currentColor"
          />
        );
      })}
    </svg>
  );
}

function PianoDiagram({ chord, size = 120 }: { chord: PianoChordData; size: number }) {
  const whiteWidth = size / 7;
  const whiteHeight = size * 0.6;
  const blackWidth = whiteWidth * 0.6;
  const blackHeight = whiteHeight * 0.6;
  const whiteNotes = [60, 62, 64, 65, 67, 69, 71];
  const blackNotes = [61, 63, -1, 66, 68, 70];
  const blackPositions = [0.7, 1.7, -1, 3.7, 4.7, 5.7];
  const isActive = (n: number) => chord.notes.includes(n);

  return (
    <svg width={size} height={whiteHeight + 10} viewBox={`0 0 ${size} ${whiteHeight + 10}`}>
      {whiteNotes.map((note, i) => (
        <rect
          key={`w-${i}`}
          x={i * whiteWidth}
          y={0}
          width={whiteWidth - 1}
          height={whiteHeight}
          fill={isActive(note) ? "#3b82f6" : "white"}
          stroke="#999"
          strokeWidth={0.5}
          rx={1}
        />
      ))}
      {blackNotes.map((note, i) => {
        if (note === -1) return null;
        return (
          <rect
            key={`b-${i}`}
            x={blackPositions[i] * whiteWidth - blackWidth / 2 + whiteWidth / 2}
            y={0}
            width={blackWidth}
            height={blackHeight}
            fill={isActive(note) ? "#2563eb" : "#333"}
            rx={1}
          />
        );
      })}
    </svg>
  );
}

export function ChordDiagram({ root, quality, instrument, size = 80 }: ChordDiagramProps) {
  const diagram = getChordDiagram(root, quality, instrument);
  if (!diagram)
    return (
      <div className="flex h-20 w-20 items-center justify-center rounded border border-border text-xs text-muted-foreground">
        N/A
      </div>
    );
  if (instrument === "piano")
    return <PianoDiagram chord={diagram as PianoChordData} size={size * 1.5} />;
  return <GuitarDiagram diagram={diagram as ChordDiagramData} size={size} />;
}
