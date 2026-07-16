export function Timeline({ interactions }) {
  if (interactions.length === 0) return <p style={{ color: "#666" }}>No interactions logged yet.</p>;

  return (
    <div>
      {interactions.map((i) => (
        <div key={i.id} style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}>
          <div style={{ fontSize: "0.85em", color: "#666" }}>
            {new Date(i.createdAt).toLocaleString()} · {i.type.replace("_", " ")}
            {i.contact ? ` · ${i.contact.name} (${i.contact.role})` : ""}
            {i.tone ? ` · ${i.tone}` : ""}
          </div>
          {i.content && <div>{i.content}</div>}
        </div>
      ))}
    </div>
  );
}
