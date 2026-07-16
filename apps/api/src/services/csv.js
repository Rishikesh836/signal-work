import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import { TIERS } from "@signalwork/shared";

const IMPORT_COLUMNS = [
  "company", "contact", "designation", "email", "phone", "profile_url",
  "source_url", "industry", "source", "tier", "signals",
  "recruiter_name", "recruiter_email", "recruiter_phone", "recruiter_profile_url",
  "hr_name", "hr_email", "hr_phone", "hr_profile_url",
];

export function parseLeadsCsv(buffer) {
  const rows = parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const valid = [];
  const errors = [];

  rows.forEach((row, index) => {
    const rowNum = index + 2; // account for header row, 1-indexed
    const rowErrors = [];

    if (!row.company) rowErrors.push("company is required");
    if (row.tier && !TIERS.includes(row.tier)) {
      rowErrors.push(`tier must be one of ${TIERS.join(", ")}`);
    }
    if (row.email && !/^\S+@\S+\.\S+$/.test(row.email)) {
      rowErrors.push("email is invalid");
    }

    if (rowErrors.length) {
      errors.push({ row: rowNum, company: row.company || "(unknown)", errors: rowErrors });
      return;
    }

    const contacts = [];
    if (row.recruiter_name) {
      contacts.push({
        role: "Recruiter",
        name: row.recruiter_name,
        email: row.recruiter_email || null,
        phone: row.recruiter_phone || null,
        profileUrl: row.recruiter_profile_url || null,
      });
    }
    if (row.hr_name) {
      contacts.push({
        role: "HR / Talent",
        name: row.hr_name,
        email: row.hr_email || null,
        phone: row.hr_phone || null,
        profileUrl: row.hr_profile_url || null,
      });
    }

    valid.push({
      company: row.company,
      contact: row.contact || null,
      designation: row.designation || null,
      email: row.email || null,
      phone: row.phone || null,
      profileUrl: row.profile_url || null,
      sourceUrl: row.source_url || null,
      industry: row.industry || null,
      source: row.source || null,
      tier: row.tier || "B",
      signals: row.signals ? row.signals.split(";").map((s) => s.trim()).filter(Boolean) : [],
      contacts,
    });
  });

  return { valid, errors };
}

export function buildLeadsCsv(leads) {
  const records = leads.map((lead) => {
    const otherPeople = (lead.contacts || [])
      .map((c) => `${c.role}: ${c.name}${c.email ? ` <${c.email}>` : ""}${c.profileUrl ? ` (${c.profileUrl})` : ""}`)
      .join(" | ");

    const interactions = lead.interactions || [];
    const lastInteraction = interactions
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    return {
      company: lead.company,
      contact: lead.contact || "",
      designation: lead.designation || "",
      email: lead.email || "",
      phone: lead.phone || "",
      profile_url: lead.profileUrl || "",
      source_url: lead.sourceUrl || "",
      industry: lead.industry || "",
      source: lead.source || "",
      tier: lead.tier || "",
      status: lead.status || "",
      signals: JSON.parse(lead.signals || "[]").join(";"),
      other_people: otherPeople,
      interaction_count: interactions.length,
      last_interaction_at: lastInteraction ? lastInteraction.createdAt : "",
    };
  });

  return stringify(records, { header: true });
}

export { IMPORT_COLUMNS };
