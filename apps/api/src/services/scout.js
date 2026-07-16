import { env } from "../config/env.js";

const TAVILY_URL = "https://api.tavily.com/search";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

function mockResults(query) {
  return [
    {
      company: "Northfield Manufacturing Co.",
      signal: `Posted a plant reliability engineer role — matches "${query}"`,
      tier: "B",
      sourceUrl: "https://example.com/mock-posting-1",
      industry: "Manufacturing",
      note: "MOCK result — set TAVILY_API_KEY and GROQ_API_KEY for real web search",
    },
    {
      company: "Meridian Trust Bank",
      signal: "Announced a digital lending transformation initiative",
      tier: "A",
      sourceUrl: "https://example.com/mock-posting-2",
      industry: "BFSI",
      note: "MOCK result — set TAVILY_API_KEY and GROQ_API_KEY for real web search",
    },
  ];
}

async function tavilySearch(query) {
  const res = await fetch(TAVILY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: env.tavilyApiKey,
      query,
      search_depth: "advanced",
      max_results: 8,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Tavily API error (${res.status}): ${text}`);
  }
  const data = await res.json();
  return data.results || [];
}

async function structureWithGroq(query, searchResults) {
  const systemPrompt = `You are a lead-research assistant. Given raw web search results, extract up to 5 candidate companies that match the target profile. For each, infer: company name, the specific buying signal found, an estimated tier (A/B/C, A = strongest fit), a likely industry, and the best source URL. Return strict JSON: {"results": [{"company": "...", "signal": "...", "tier": "A|B|C", "sourceUrl": "...", "industry": "..."}]}`;

  const userPrompt = JSON.stringify({
    targetProfile: query,
    searchResults: searchResults.map((r) => ({
      title: r.title,
      url: r.url,
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
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
  return parsed.results || [];
}

export async function scoutLeads(query) {
  if (!env.tavilyApiKey || !env.groqApiKey) {
    return mockResults(query);
  }

  try {
    const searchResults = await tavilySearch(query);
    if (!searchResults.length) return [];
    const results = await structureWithGroq(query, searchResults);
    return results.slice(0, 5);
  } catch (err) {
    console.error("Scout search failed, falling back to mock:", err.message);
    return mockResults(query);
  }
}
