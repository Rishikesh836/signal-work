import { useMemo, useState } from "react";
import { ROLE_RANK, OFFERINGS, DRAFT_TONES } from "../../constants.js";
import { generateDrafts, addInteraction } from "../../api/leads.js";
import { DraftTonePicker } from "./DraftTonePicker.jsx";
import { HierarchyNudge } from "./HierarchyNudge.jsx";
import { CopyButton } from "../shared/CopyButton.jsx";
import { OfferingPicker } from "../leads/OfferingPicker.jsx";

export function Composer({ lead, contacts, onLogged }) {
  const sortedContacts = useMemo(
    () => [...contacts].sort((a, b) => (ROLE_RANK[a.role] ?? 99) - (ROLE_RANK[b.role] ?? 99)),
    [contacts]
  );

  const [targetContactId, setTargetContactId] = useState("");
  const [offerings, setOfferings] = useState(
    lead.offerings?.length ? lead.offerings : [{ ...OFFERINGS[0], custom: false }]
  );
  const [drafts, setDrafts] = useState(null);
  const [nudge, setNudge] = useState(null);
  const [tone, setTone] = useState("formal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const targetContact = sortedContacts.find((c) => c.id === targetContactId) || null;

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setDrafts(null);
    setCopied(false);
    try {
      const result = await generateDrafts(lead.id, { targetContactId: targetContactId || undefined, offerings });
      const byTone = Object.fromEntries(result.drafts.map((d) => [d.tone, d]));
      setDrafts(byTone);
      setNudge(result.nudge);
      setTone("formal");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleTargetChange(id) {
    setTargetContactId(id);
    setDrafts(null);
    setNudge(null);
    setCopied(false);
  }

  async function handleCopied() {
    setCopied(true);
    await addInteraction(lead.id, {
      type: "email_sent",
      contactId: targetContactId || null,
      tone,
      content: drafts[tone].subject,
    });
    onLogged?.();
  }

  return (
    <div className="card">
      <h3>Composer</h3>

      <label>Sending to</label>
      <select value={targetContactId} onChange={(e) => handleTargetChange(e.target.value)}>
        <option value="">{lead.contact || "Primary contact"} (lead default)</option>
        {sortedContacts.map((c) => (
          <option key={c.id} value={c.id}>{c.name} — {c.role}</option>
        ))}
      </select>

      <OfferingPicker value={offerings} onChange={setOfferings} />

      <button className="btn" style={{ marginTop: 16 }} onClick={handleGenerate} disabled={loading || offerings.length === 0}>
        {loading ? "Generating…" : "Generate drafts"}
      </button>

      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}

      {drafts && (
        <div style={{ marginTop: 20 }}>
          <HierarchyNudge nudge={nudge} />
          <DraftTonePicker tones={DRAFT_TONES} active={tone} onChange={setTone} />
          <h4>{drafts[tone].subject}</h4>
          <p style={{ whiteSpace: "pre-wrap" }}>{drafts[tone].body}</p>
          <CopyButton text={`${drafts[tone].subject}\n\n${drafts[tone].body}`} onCopied={handleCopied} />

          {copied && (
            <div style={{ marginTop: 12, fontSize: "0.9em" }}>
              {targetContact?.profileUrl && <div><a href={targetContact.profileUrl} target="_blank" rel="noreferrer">Contact profile ↗</a></div>}
              {lead.profileUrl && <div><a href={lead.profileUrl} target="_blank" rel="noreferrer">Company link ↗</a></div>}
              {lead.sourceUrl && <div><a href={lead.sourceUrl} target="_blank" rel="noreferrer">View original posting ↗</a></div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
