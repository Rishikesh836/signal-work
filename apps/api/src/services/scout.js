import { env } from "../config/env.js";

const TAVILY_URL = "https://api.tavily.com/search";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const PLATFORM_DOMAINS = {
  linkedin: ["linkedin.com"],
  naukri: ["naukri.com"],
  // "other" means no domain restriction — the open web (company sites, news,
  // Indeed, Glassdoor, etc). Handled specially below.
};

const VALID_TIME_RANGES = new Set(["day", "week", "month", "year"]);
const DEFAULT_RESULT_COUNT = 20;
const MAX_RESULT_COUNT = 30;
const MIN_RESULT_COUNT = 5;

function clampResultCount(n) {
  const num = Number(n) || DEFAULT_RESULT_COUNT;
  return Math.max(MIN_RESULT_COUNT, Math.min(MAX_RESULT_COUNT, Math.round(num)));
}

function mockResults(query) {
  return [
    {
      company: "Northfield Manufacturing Co.",
      signal: `Posted a plant reliability engineer role — matches "${query}"`,
      tier: "B",
      sourceUrl: "https://www.linkedin.com/jobs/",
      industry: "Manufacturing",
      publishedDate: null,
      isClosed: false,
      note: "MOCK result — set TAVILY_API_KEY and GROQ_API_KEY for real web search",
    },
    {
      company: "Meridian Trust Bank",
      signal: "Announced a digital lending transformation initiative",
      tier: "A",
      sourceUrl: "https://www.naukri.com/",
      industry: "BFSI",
      publishedDate: null,
      isClosed: false,
      note: "MOCK result — set TAVILY_API_KEY and GROQ_API_KEY for real web search",
    },
  ];
}

async function tavilySearchOnce(query, domains, timeRange) {
  const res = await fetch(TAVILY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: env.tavilyApiKey,
      query,
      search_depth: "advanced",
      max_results: 20,
      include_domains: domains,
      time_range: VALID_TIME_RANGES.has(timeRange) ? timeRange : undefined,
      include_raw_content: false,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Tavily API error (${res.status}): ${text}`);
  }
  const data = await res.json();
  return (data.results || []).filter((r) => r.url);
}

// Runs one Tavily search per selected platform (rather than one search with a combined
// domain filter) so each platform gets its own full result budget, then merges + dedupes
// by URL. This is what lets us pull a much larger, more diverse pool (up to ~40 raw hits)
// for Groq to select 20-30 leads from, instead of being capped by a single 10-result call.
async function tavilySearch(query, platforms, timeRange) {
  const list = Array.isArray(platforms) && platforms.length ? platforms : ["linkedin", "naukri"];

  const searches = list.includes("other")
    ? [tavilySearchOnce(query, undefined, timeRange)]
    : list.map((p) => tavilySearchOnce(query, PLATFORM_DOMAINS[p] || undefined, timeRange));

  const batches = await Promise.all(searches);
  const seen = new Set();
  const merged = [];
  for (const batch of batches) {
    for (const r of batch) {
      if (seen.has(r.url)) continue;
      seen.add(r.url);
      merged.push(r);
    }
  }
  return merged;
}

async function structureWithGroq(query, searchResults, resultCount) {
  // The model only ever picks an index into searchResults — it never invents a URL.
  // This is what keeps sourceUrl links real and clickable instead of hallucinated.
  const systemPrompt = `You are a lead-research assistant. You will be given a numbered list of real, dated web search results (each with an index, title, url, published date, content snippet) and a target lead profile. Pick up to ${resultCount} results that best match the profile as candidate leads.

Strongly prefer:
- Specific individual job postings (a named role at a named company) over generic search/listing/aggregator pages (e.g. a page titled "reliability engineer jobs" with no single named employer is NOT a good pick).
- The most recently published/dated results over older ones when several results are otherwise similar.
- Results that clearly name the hiring or newsworthy company, not just a job board's category page.

Also determine isClosed for each pick: set it to true ONLY if the content snippet contains explicit evidence the posting is no longer open — phrases like "no longer accepting applications", "this position has been filled", "job has expired", "applications are closed", "no longer active". If there is no such explicit evidence, set isClosed to false (do not guess closed).

For each pick, return the original result's index (do not invent URLs or dates), the company name, the specific buying signal found in that result (quote or closely paraphrase what the posting/article actually says), an estimated tier (A/B/C, A = strongest fit), a likely industry, and isClosed. Return strict JSON: {"results": [{"sourceIndex": 0, "company": "...", "signal": "...", "tier": "A|B|C", "industry": "...", "isClosed": false}]}`;

  const userPrompt = JSON.stringify({
    targetProfile: query,
    searchResults: searchResults.map((r, i) => ({
      index: i,
      title: r.title,
      url: r.url,
      publishedDate: r.published_date || null,
      content: r.content?.slice(0, 500),
    })),
  });

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.groqApiKey}`,
    },
    body: JSON.stringify({
      model: env.groqModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
  const picks = parsed.results || [];

  return picks
    .filter((p) => Number.isInteger(p.sourceIndex) && searchResults[p.sourceIndex])
    .map((p) => ({
      company: p.company,
      signal: p.signal,
      tier: p.tier,
      industry: p.industry,
      sourceUrl: searchResults[p.sourceIndex].url,
      publishedDate: searchResults[p.sourceIndex].published_date || null,
      isClosed: !!p.isClosed,
    }));
}

export async function scoutLeads(query, platforms, timeRange, resultCount) {
  const count = clampResultCount(resultCount);

  if (!env.tavilyApiKey || !env.groqApiKey) {
    return mockResults(query);
  }

  try {
    const searchResults = await tavilySearch(query, platforms, timeRange);
    if (!searchResults.length) return [];
    const results = await structureWithGroq(query, searchResults, count);
    return results.slice(0, count);
  } catch (err) {
    console.error("Scout search failed, falling back to mock:", err.message);
    return mockResults(query);
  }
}
