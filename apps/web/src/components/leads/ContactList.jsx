import { useState } from "react";
import { CONTACT_ROLES } from "../../constants.js";
import { ConfirmDelete } from "../shared/ConfirmDelete.jsx";

export function ContactList({ contacts, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ role: CONTACT_ROLES[0], name: "", designation: "", email: "", phone: "", profileUrl: "" });

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleAdd(e) {
    e.preventDefault();
    await onAdd(form);
    setForm({ role: CONTACT_ROLES[0], name: "", designation: "", email: "", phone: "", profileUrl: "" });
    setShowForm(false);
  }

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3>Other people at this company</h3>
        <button className="btn secondary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Close" : "Add contact"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd}>
          <label>Role</label>
          <select value={form.role} onChange={(e) => update("role", e.target.value)}>
            {CONTACT_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <label>Name</label>
          <input value={form.name} onChange={(e) => update("name", e.target.value)} required />
          <label>Designation</label>
          <input value={form.designation} onChange={(e) => update("designation", e.target.value)} />
          <label>Email</label>
          <input value={form.email} onChange={(e) => update("email", e.target.value)} />
          <label>Profile URL</label>
          <input value={form.profileUrl} onChange={(e) => update("profileUrl", e.target.value)} />
          <button className="btn" type="submit" style={{ marginTop: 12 }}>Add</button>
        </form>
      )}

      {contacts.length === 0 && <p style={{ color: "#666" }}>No other contacts logged yet.</p>}
      {contacts.map((c) => (
        <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #eee" }}>
          <div>
            <strong>{c.name}</strong> — {c.role}
            {c.designation ? ` (${c.designation})` : ""}
            {c.email && <div style={{ fontSize: "0.85em", color: "#666" }}>{c.email}</div>}
          </div>
          <ConfirmDelete label="Remove" onConfirm={() => onDelete(c.id)} />
        </div>
      ))}
    </div>
  );
}
