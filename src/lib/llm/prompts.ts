import type { LLMMessage } from "./types";

export function buildSectionDetectionPrompt(rawText: string): LLMMessage[] {
  return [
    {
      role: "system",
      content: `You are an expert music analyst. Given song lyrics (with or without chords), identify the different sections of the song.

Return a JSON object with this structure:
{
  "title": "Song Title (if detectable)",
  "artist": "Artist (if detectable)",
  "key": "Musical key (if detectable)",
  "sections": [
    {
      "type": "verse|chorus|bridge|pre_chorus|intro|outro|interlude|tag|custom",
      "label": "Verse 1",
      "startLine": 0,
      "endLine": 5
    }
  ]
}

Section types: verse, chorus, bridge, pre_chorus, intro, outro, interlude, tag, custom.
Line numbers are 0-indexed from the original text.
Be precise with section boundaries. Look for patterns like repeated sections (chorus), lyrical progression (verses), contrasting sections (bridge).`,
    },
    {
      role: "user",
      content: `Analyze this song and identify its sections:\n\n${rawText}`,
    },
  ];
}

export function buildChordSuggestionPrompt(lyrics: string, key?: string): LLMMessage[] {
  return [
    {
      role: "system",
      content: `You are an expert musician and chord arranger. Given song lyrics, suggest appropriate chord placements.

Return a JSON object with this structure:
{
  "key": "Suggested key",
  "sections": [
    {
      "lines": [
        {
          "lyrics": "original lyric line",
          "chords": [
            { "chord": "Am", "position": 0 },
            { "chord": "G", "position": 15 }
          ]
        }
      ]
    }
  ]
}

Rules:
- Use standard chord notation (C, Am, G7, Fmaj7, etc.)
- Place chords at syllable boundaries where they sound natural
- Position is the character offset in the lyric line
- Keep chord progressions musically coherent
- Match the mood and style of the lyrics${key ? `\n- The song is in the key of ${key}` : ""}`,
    },
    {
      role: "user",
      content: `Suggest chords for these lyrics:\n\n${lyrics}`,
    },
  ];
}
