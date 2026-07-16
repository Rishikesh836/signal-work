export function FunnelChart({ funnel }) {
  const max = Math.max(1, ...Object.values(funnel));

  return (
    <div className="card">
      <h3>Funnel by status</h3>
      {Object.entries(funnel).map(([status, count]) => (
        <div key={status} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85em" }}>
            <span>{status}</span>
            <span>{count}</span>
          </div>
          <div style={{ background: "#E7ECE9", borderRadius: 6, height: 8 }}>
            <div
              style={{
                width: `${(count / max) * 100}%`,
                background: "var(--accent)",
                height: 8,
                borderRadius: 6,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
