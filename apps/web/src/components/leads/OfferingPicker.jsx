import { useState } from "react";
import { OFFERINGS } from "../../constants.js";

// value: array of { id, name, outcome, custom }
export function OfferingPicker({ value, onChange }) {
  const [customName, setCustomName] = useState("");
  const [customOutcome, setCustomOutcome] = useState("");

  function toggleOffering(offering) {
    const exists = value.some((v) => v.id === offering.id);
    if (exists) {
      onChange(value.filter((v) => v.id !== offering.id));
    } else {
      onChange([...value, { id: offering.id, name: offering.name, outcome: offering.outcome, custom: false }]);
    }
  }

  function addCustom() {
    if (!customName.trim()) return;
    onChange([
      ...value,
      { id: `custom-${Date.now()}`, name: customName.trim(), outcome: customOutcome.trim(), custom: true },
    ]);
    setCustomName("");
    setCustomOutcome("");
  }

  function removeCustom(id) {
    onChange(value.filter((v) => v.id !== id));
  }

  const customEntries = value.filter((v) => v.custom);

  return (
    <div>
      <label>Offerings (select any that apply)</label>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {OFFERINGS.map((o) => (
          <label key={o.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontWeight: 400 }}>
            <input
              type="checkbox"
              style={{ width: "auto", marginTop: 3 }}
              checked={value.some((v) => v.id === o.id)}
              onChange={() => toggleOffering(o)}
            />
            <span>
              <strong>{o.name}</strong>
              <div style={{ fontSize: "0.85em", color: "#666" }}>{o.outcome}</div>
            </span>
          </label>
        ))}
      </div>

      {customEntries.length > 0 && (
        <div style={{ marginTop: 10 }}>
          {customEntries.map((c) => (
            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #eee" }}>
              <div>
                <strong>{c.name}</strong>
                {c.outcome && <div style={{ fontSize: "0.85em", color: "#666" }}>{c.outcome}</div>}
              </div>
              <button type="button" className="btn secondary" onClick={() => removeCustom(c.id)}>Remove</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <label style={{ marginTop: 0 }}>Custom offering name</label>
          <input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Write your own…" />
        </div>
        <div style={{ flex: 2 }}>
          <label style={{ marginTop: 0 }}>Outcome / pitch (optional)</label>
          <input value={customOutcome} onChange={(e) => setCustomOutcome(e.target.value)} placeholder="What it does for the prospect…" />
        </div>
        <button type="button" className="btn secondary" onClick={addCustom}>Add</button>
      </div>
    </div>
  );
}
