/**
 * Web search utility for finding chord sheets online.
 * Uses DuckDuckGo HTML search (no API key required).
 */

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

/**
 * Search for chord sheets using DuckDuckGo HTML search.
 */
export async function searchChords(query: string): Promise<SearchResult[]> {
  const searchQuery = `${query} chords lyrics`;
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "ChordSheet-Editor/1.0",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) return [];

  const html = await res.text();
  const results: SearchResult[] = [];

  // Extract results from DuckDuckGo HTML response
  const resultBlocks = html.split(/class="result\s/);
  for (const block of resultBlocks.slice(1, 6)) {
    const titleMatch = block.match(/class="result__a"[^>]*>([^<]+)</);
    const urlMatch = block.match(/href="([^"]+)"/);
    const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\//);

    if (titleMatch && urlMatch) {
      let href = urlMatch[1];
      // DuckDuckGo wraps URLs in a redirect - extract the actual URL
      const actualUrl = href.match(/uddg=([^&]+)/);
      if (actualUrl) {
        href = decodeURIComponent(actualUrl[1]);
      }

      results.push({
        title: titleMatch[1].replace(/&amp;/g, "&").trim(),
        url: href,
        snippet: (snippetMatch?.[1] || "")
          .replace(/<[^>]+>/g, "")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .trim(),
      });
    }
  }

  return results;
}

/**
 * Fetch and extract text content from a chord page URL.
 */
export async function fetchChordPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "ChordSheet-Editor/1.0" },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) return "";

  const html = await res.text();

  // Strip scripts, styles, and HTML tags to get text content
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Limit to first 5000 chars to avoid huge payloads
  return text.slice(0, 5000);
}

/**
 * Search for chords online and return aggregated content for LLM processing.
 */
export async function searchAndFetchChords(songQuery: string): Promise<string> {
  const results = await searchChords(songQuery);

  if (results.length === 0) {
    return `No search results found for "${songQuery}". The LLM should try to provide chords from its own knowledge.`;
  }

  // Fetch content from top 2 results
  const pages = await Promise.allSettled(
    results.slice(0, 2).map(async (r) => {
      const content = await fetchChordPage(r.url);
      return { title: r.title, url: r.url, content };
    }),
  );

  const contents = pages
    .filter(
      (p): p is PromiseFulfilledResult<{ title: string; url: string; content: string }> =>
        p.status === "fulfilled" && p.value.content.length > 100,
    )
    .map((p) => p.value);

  if (contents.length === 0) {
    // Fallback: use snippets from search results
    const snippetText = results.map((r) => `Source: ${r.title}\n${r.snippet}`).join("\n\n");
    return `Search results (snippets only):\n\n${snippetText}`;
  }

  return contents.map((c) => `=== Source: ${c.title} (${c.url}) ===\n${c.content}`).join("\n\n");
}
