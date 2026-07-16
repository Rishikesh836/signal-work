export function TierCounts({ tierCounts }) {
  return (
    <div className="card">
      <h3>Leads by tier</h3>
      <div style={{ display: "flex", gap: 24 }}>
        {Object.entries(tierCounts).map(([tier, count]) => (
          <div key={tier}>
            <div style={{ fontSize: "1.8em", fontWeight: 700 }}>{count}</div>
            <div style={{ color: "#666" }}>Tier {tier}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
