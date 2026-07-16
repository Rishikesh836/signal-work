import { useState } from "react";
import { INTERACTION_TYPES } from "../../constants.js";

export function InteractionForm({ onSubmit }) {
  const [type, setType] = useState("note");
  const [content, setContent] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    await onSubmit({ type, content });
    setContent("");
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: 160 }}>
        {INTERACTION_TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
      </select>
      <input placeholder="Note or details…" value={content} onChange={(e) => setContent(e.target.value)} />
      <button className="btn" type="submit">Log</button>
    </form>
  );
}
