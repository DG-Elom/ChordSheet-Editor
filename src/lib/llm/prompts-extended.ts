import type { LLMMessage } from "./types";

export function buildSearchChordsPrompt(
  songQuery: string,
  searchResults: string,
  key?: string,
): LLMMessage[] {
  return [
    {
      role: "system",
      content: `You are an expert musician. You are given web search results containing chord sheets for a song. Your job is to extract and format the correct chords with lyrics.

Return a clean, well-formatted chord sheet with:
- Song title and artist at the top
- Section markers like [Verse 1], [Chorus], [Bridge], etc.
- Chords placed above the lyrics at the correct positions
- Standard chord notation (C, Am, G7, Fmaj7, etc.)

If the search results are incomplete or unclear, use your musical knowledge to fill in gaps.
If multiple sources disagree, prefer the most common/standard version.
${key ? `Transpose to the key of ${key} if needed.` : ""}
Do NOT return JSON. Return a plain text chord sheet ready to be used by a musician.`,
    },
    {
      role: "user",
      content: `Find the correct chords for: "${songQuery}"\n\nHere are the web search results:\n\n${searchResults}`,
    },
  ];
}

export function buildLyricsGenerationPrompt(
  theme: string,
  style?: string,
  key?: string,
): LLMMessage[] {
  return [
    {
      role: "system",
      content: `You are a talented songwriter. Generate original song lyrics based on the given theme and style.

Return a JSON object:
{
  "title": "Song Title",
  "lyrics": "Full lyrics with section markers like [Verse 1], [Chorus], etc.",
  "suggestedKey": "Suggested musical key",
  "suggestedTempo": "Suggested tempo description"
}

Rules:
- Write original, creative lyrics
- Include clear section markers
- Match the requested style/mood
- Keep verses consistent in structure
${key ? `- Write in the key/mood of ${key}` : ""}
${style ? `- Style: ${style}` : ""}`,
    },
    { role: "user", content: `Write song lyrics about: ${theme}` },
  ];
}

export function buildHarmonizationPrompt(chords: string[], key?: string): LLMMessage[] {
  return [
    {
      role: "system",
      content: `You are an expert music theorist. Given a chord progression, suggest alternative harmonizations and reharmonizations.

Return a JSON object:
{
  "originalAnalysis": "Brief analysis of the original progression",
  "alternatives": [
    {
      "name": "Jazz Reharmonization",
      "chords": ["Cmaj7", "Dm9", "G13", "Cmaj7"],
      "explanation": "Why this works"
    }
  ],
  "substitutions": [
    { "original": "C", "substitutes": ["Am7", "Cmaj7", "Em"], "reason": "..." }
  ]
}

Provide 3-4 alternative progressions in different styles (jazz, pop, classical, etc.).
${key ? `The song is in ${key}.` : ""}`,
    },
    { role: "user", content: `Suggest alternative harmonizations for: ${chords.join(" - ")}` },
  ];
}

export function buildHarmonicAnalysisPrompt(content: string, key?: string): LLMMessage[] {
  return [
    {
      role: "system",
      content: `You are an expert music analyst. Analyze the harmony and chord progressions in the given song.

Return a JSON object:
{
  "key": "Detected key",
  "mode": "Major/Minor/Modal",
  "analysis": {
    "overview": "General harmonic analysis",
    "chordFunctions": [
      { "chord": "C", "function": "I (Tonic)", "context": "..." }
    ],
    "progressionPatterns": ["I-V-vi-IV pattern in chorus"],
    "modulations": ["Brief modulation to relative minor in bridge"],
    "notableFeatures": ["Use of secondary dominants", "Modal interchange"]
  },
  "suggestions": ["Consider adding a ii-V-I turnaround", "..."]
}
${key ? `The song is in ${key}.` : ""}`,
    },
    { role: "user", content: `Analyze the harmony of this song:\n\n${content}` },
  ];
}
