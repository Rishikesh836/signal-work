const NUDGE_TARGET_ROLES = new Set(["Decision maker", "Executive (CEO/Founder)"]);
const GATEKEEPER_ROLES = new Set(["Recruiter", "HR / Talent"]);

/**
 * Suggests going through a recruiter/HR contact first when composing to a
 * Decision maker or Executive, if such a gatekeeper exists on the lead and
 * hasn't been contacted yet.
 */
export function getHierarchyNudge({ targetContact, contacts, interactions }) {
  if (!targetContact || !NUDGE_TARGET_ROLES.has(targetContact.role)) {
    return null;
  }

  const gatekeepers = contacts.filter((c) => GATEKEEPER_ROLES.has(c.role));
  if (!gatekeepers.length) return null;

  const contactedIds = new Set(
    interactions
      .filter((i) => i.type === "email_sent" || i.type === "linkedin_sent")
      .map((i) => i.contactId)
      .filter(Boolean)
  );

  const uncontacted = gatekeepers.find((g) => !contactedIds.has(g.id));
  if (!uncontacted) return null;

  return {
    contactId: uncontacted.id,
    contactName: uncontacted.name,
    role: uncontacted.role,
    message: `Consider reaching out to ${uncontacted.name} (${uncontacted.role}) first — no outreach has been logged to them yet, and they may be a faster path in.`,
  };
}
