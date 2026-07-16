import { useEffect, useState } from "react";
import { PageHeader } from "../components/layout/PageHeader.jsx";
import { LeadCard } from "../components/leads/LeadCard.jsx";
import { LeadForm } from "../components/leads/LeadForm.jsx";
import { listLeads, createLead } from "../api/leads.js";
import { useDebounce } from "../hooks/useDebounce.js";
import { TIERS, STATUSES } from "../constants.js";

export function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState("");
  const [status, setStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    listLeads({ search: debouncedSearch, tier, status })
      .then((data) => setLeads(data.leads))
      .catch((err) => setError(err.message));
  }, [debouncedSearch, tier, status]);

  async function handleCreate(data) {
    await createLead(data);
    setShowForm(false);
    const data2 = await listLeads({ search: debouncedSearch, tier, status });
    setLeads(data2.leads);
  }

  return (
    <div>
      <PageHeader
        title="Leads"
        actions={<button className="btn" onClick={() => setShowForm((v) => !v)}>{showForm ? "Close" : "New lead"}</button>}
      />

      {showForm && <LeadForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}

      <div className="card" style={{ display: "flex", gap: 12 }}>
        <input placeholder="Search company, contact, signal…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={tier} onChange={(e) => setTier(e.target.value)}>
          <option value="">All tiers</option>
          {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
      {leads.map((lead) => <LeadCard key={lead.id} lead={lead} />)}
      {leads.length === 0 && !error && <p style={{ color: "#666" }}>No leads found.</p>}
    </div>
  );
}
