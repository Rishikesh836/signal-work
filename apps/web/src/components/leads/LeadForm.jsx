import { useState } from "react";
import { TIERS, STATUSES, OFFERINGS } from "../../constants.js";

const EMPTY = {
  company: "", contact: "", designation: "", email: "", phone: "",
  profileUrl: "", sourceUrl: "", industry: "", source: "",
  tier: "B", status: "Researched", offering: "", signals: "",
};

export function LeadForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY,
    ...initial,
    signals: initial?.signals ? initial.signals.join(", ") : "",
  }));

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      ...form,
      signals: form.signals.split(",").map((s) => s.trim()).filter(Boolean),
    });
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <label>Company *</label>
      <input value={form.company} onChange={(e) => update("company", e.target.value)} required />

      <label>Primary contact</label>
      <input value={form.contact} onChange={(e) => update("contact", e.target.value)} />

      <label>Designation</label>
      <input value={form.designation} onChange={(e) => update("designation", e.target.value)} />

      <label>Email</label>
      <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />

      <label>Phone</label>
      <input value={form.phone} onChange={(e) => update("phone", e.target.value)} />

      <label>Profile URL (person or company page)</label>
      <input value={form.profileUrl} onChange={(e) => update("profileUrl", e.target.value)} />

      <label>Source URL (the job posting / article / announcement)</label>
      <input value={form.sourceUrl} onChange={(e) => update("sourceUrl", e.target.value)} />

      <label>Industry</label>
      <input value={form.industry} onChange={(e) => update("industry", e.target.value)} />

      <label>Source</label>
      <input value={form.source} onChange={(e) => update("source", e.target.value)} />

      <label>Buying signals (comma-separated)</label>
      <input value={form.signals} onChange={(e) => update("signals", e.target.value)} />

      <label>Tier</label>
      <select value={form.tier} onChange={(e) => update("tier", e.target.value)}>
        {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>

      <label>Status</label>
      <select value={form.status} onChange={(e) => update("status", e.target.value)}>
        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <label>Offering</label>
      <select value={form.offering} onChange={(e) => update("offering", e.target.value)}>
        <option value="">— none —</option>
        {OFFERINGS.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>

      <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
        <button className="btn" type="submit">Save</button>
        {onCancel && <button type="button" className="btn secondary" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
