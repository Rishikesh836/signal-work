import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader.jsx";
import { LeadForm } from "../components/leads/LeadForm.jsx";
import { ContactList } from "../components/leads/ContactList.jsx";
import { Composer } from "../components/composer/Composer.jsx";
import { Timeline } from "../components/crm/Timeline.jsx";
import { InteractionForm } from "../components/crm/InteractionForm.jsx";
import { SignalChip } from "../components/shared/SignalChip.jsx";
import { Badge } from "../components/shared/Badge.jsx";
import { ConfirmDelete } from "../components/shared/ConfirmDelete.jsx";
import {
  getLead, updateLead, deleteLead, addContact, deleteContact,
  listInteractions, addInteraction,
} from "../api/leads.js";

export function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    const [leadData, interactionData] = await Promise.all([getLead(id), listInteractions(id)]);
    setLead(leadData);
    setInteractions(interactionData);
  }, [id]);

  useEffect(() => {
    refresh().catch((err) => setError(err.message));
  }, [refresh]);

  if (error) return <p style={{ color: "var(--danger)" }}>{error}</p>;
  if (!lead) return <p>Loading…</p>;

  async function handleSave(data) {
    await updateLead(id, data);
    setEditing(false);
    await refresh();
  }

  async function handleDelete() {
    await deleteLead(id);
    navigate("/leads");
  }

  async function handleAddContact(data) {
    await addContact(id, data);
    await refresh();
  }

  async function handleDeleteContact(contactId) {
    await deleteContact(contactId);
    await refresh();
  }

  async function handleLogInteraction(data) {
    await addInteraction(id, data);
    await refresh();
  }

  return (
    <div>
      <PageHeader
        title={lead.company}
        actions={
          <>
            <button className="btn secondary" onClick={() => setEditing((v) => !v)} style={{ marginRight: 8 }}>
              {editing ? "Close" : "Edit"}
            </button>
            <ConfirmDelete label="Delete lead" onConfirm={handleDelete} />
          </>
        }
      />

      {editing ? (
        <LeadForm initial={lead} onSubmit={handleSave} onCancel={() => setEditing(false)} />
      ) : (
        <div className="card">
          <div>
            <Badge>Tier {lead.tier}</Badge> <Badge>{lead.status}</Badge>
          </div>
          <p>{lead.contact} {lead.designation ? `— ${lead.designation}` : ""}</p>
          {lead.email && <p>{lead.email}</p>}

          <h4>Buying signals</h4>
          <div>
            {lead.signals.map((s, i) => <SignalChip key={i}>{s}</SignalChip>)}
          </div>
          {lead.sourceUrl && (
            <p style={{ marginTop: 8 }}>
              <a href={lead.sourceUrl} target="_blank" rel="noreferrer">View original posting ↗</a>
              <br />
              <span style={{ fontSize: "0.85em", color: "#666" }}>
                Job posts often name a recruiter or HR contact directly — worth checking before reaching out cold.
              </span>
            </p>
          )}
          {lead.profileUrl && (
            <p><a href={lead.profileUrl} target="_blank" rel="noreferrer">Company / profile link ↗</a></p>
          )}
        </div>
      )}

      <ContactList contacts={lead.contacts} onAdd={handleAddContact} onDelete={handleDeleteContact} />

      <Composer lead={lead} contacts={lead.contacts} onLogged={refresh} />

      <div className="card">
        <h3>CRM timeline</h3>
        <InteractionForm onSubmit={handleLogInteraction} />
        <Timeline interactions={interactions} />
      </div>
    </div>
  );
}
