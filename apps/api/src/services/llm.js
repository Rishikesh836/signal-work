import { env } from "../config/env.js";
import { OFFERINGS, matchCaseStudy } from "@signalwork/shared";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

async function callGroqJson(systemPrompt, userPrompt) {
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
      temperature: 0.6,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  return JSON.parse(content);
}

function mockDrafts(lead, targetContact, offerings, caseStudy) {
  const salutation = targetContact?.name ? `Hi ${targetContact.name.split(" ")[0]}` : "Hi there";
  const signal = (JSON.parse(lead.signals || "[]"))[0] || "a recent signal at your company";
  const [primary, ...rest] = offerings;
  const alsoHelps = rest.length
    ? ` We can also help with ${rest.map((o) => o.name).join(", ")}.`
    : "";
  const base = `${salutation},\n\nNoticed ${signal} at ${lead.company} — that's often the moment ${primary.name} pays off (${primary.outcome}).${alsoHelps} ${caseStudy.summary}\n\nWorth a quick chat?`;
  return {
    formal: { subject: `${primary.name} for ${lead.company}`, body: `[MOCK - set GROQ_API_KEY for real drafts]\n\n${base}\n\nBest regards,\nSignalwork` },
    consultative: { subject: `A thought on ${lead.company}'s ${lead.industry || "roadmap"}`, body: `[MOCK - set GROQ_API_KEY for real drafts]\n\n${base}\n\nHappy to share more if useful.` },
    brief: { subject: `Quick idea for ${lead.company}`, body: `[MOCK - set GROQ_API_KEY for real drafts]\n\n${base}` },
  };
}

export async function generateDraftVariants({ lead, targetContact, offerings }) {
  const resolvedOfferings = offerings?.length ? offerings : [OFFERINGS[0]];
  const caseStudy = matchCaseStudy(lead.industry);
  const signals = JSON.parse(lead.signals || "[]");

  if (!env.groqApiKey) {
    return mockDrafts(lead, targetContact, resolvedOfferings, caseStudy);
  }

  const systemPrompt = `You are an outreach copywriter for an AI consulting firm. Generate 3 short outreach email drafts in different tones: formal, consultative, brief. Ground each draft in the lead's buying signal, the given case study, and the given offering(s) — lead with the first offering, and only briefly mention any additional ones. Return strict JSON: {"formal": {"subject": "...", "body": "..."}, "consultative": {"subject": "...", "body": "..."}, "brief": {"subject": "...", "body": "..."}}`;

  const userPrompt = JSON.stringify({
    company: lead.company,
    industry: lead.industry,
    signals,
    targetContact: targetContact
      ? { name: targetContact.name, role: targetContact.role, designation: targetContact.designation }
      : null,
    offerings: resolvedOfferings.map((o) => ({ name: o.name, outcome: o.outcome })),
    caseStudy: { industry: caseStudy.industry, summary: caseStudy.summary },
  });

  try {
    return await callGroqJson(systemPrompt, userPrompt);
  } catch (err) {
    console.error("Groq draft generation failed, falling back to mock:", err.message);
    return mockDrafts(lead, targetContact, resolvedOfferings, caseStudy);
  }
}
