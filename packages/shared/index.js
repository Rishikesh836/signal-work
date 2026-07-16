export const TIERS = ["A", "B", "C"];

export const STATUSES = [
  "Researched",
  "Contacted",
  "Engaged",
  "Meeting Booked",
  "Proposal Sent",
  "Won",
  "Lost",
];

export const CONTACT_ROLES = [
  "Recruiter",
  "HR / Talent",
  "Champion / Referral",
  "Decision maker",
  "Executive (CEO/Founder)",
  "Other",
];

export const ROLE_RANK = {
  "Recruiter": 0,
  "HR / Talent": 1,
  "Champion / Referral": 2,
  "Decision maker": 3,
  "Executive (CEO/Founder)": 4,
  "Other": 2,
};

export const INTERACTION_TYPES = [
  "email_sent",
  "linkedin_sent",
  "response",
  "call",
  "note",
];

export const DRAFT_TONES = ["formal", "consultative", "brief"];

export const OFFERINGS = [
  {
    id: "predictive-maintenance",
    name: "Predictive Maintenance Copilot",
    outcome: "Cuts unplanned downtime by flagging equipment failures before they happen.",
  },
  {
    id: "risk-underwriting",
    name: "Automated Risk & Underwriting Assistant",
    outcome: "Speeds up underwriting decisions while tightening risk controls.",
  },
  {
    id: "grid-ops-copilot",
    name: "Grid Operations Copilot",
    outcome: "Helps operators anticipate load spikes and outages in real time.",
  },
  {
    id: "fan-engagement-ai",
    name: "Fan Engagement Intelligence",
    outcome: "Turns fan data into personalized offers that lift ticket and merch sales.",
  },
];

export const CASE_STUDIES = [
  {
    id: "manufacturing-1",
    industry: "Manufacturing",
    summary: "A mid-size auto-parts manufacturer cut unplanned line stoppages by 34% within two quarters using predictive maintenance models on existing sensor data.",
  },
  {
    id: "bfsi-1",
    industry: "BFSI",
    summary: "A regional bank reduced average loan underwriting time from 5 days to 6 hours with an automated risk-scoring assistant, without loosening approval standards.",
  },
  {
    id: "utilities-1",
    industry: "Utilities",
    summary: "A regional utility reduced storm-related outage response time by 40% after deploying a grid operations copilot for dispatchers.",
  },
  {
    id: "sports-1",
    industry: "Sports",
    summary: "A pro sports franchise lifted season-ticket renewal rate by 12% using fan engagement intelligence to personalize renewal offers.",
  },
];

export function matchCaseStudy(industry) {
  if (!industry) return CASE_STUDIES[0];
  const found = CASE_STUDIES.find(
    (c) => c.industry.toLowerCase() === String(industry).toLowerCase()
  );
  return found || CASE_STUDIES[0];
}
