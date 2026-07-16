import { Link } from "react-router-dom";

export function FollowUpList({ followUps }) {
  return (
    <div className="card">
      <h3>Upcoming & overdue follow-ups</h3>
      {followUps.length === 0 && <p style={{ color: "#666" }}>No follow-ups scheduled.</p>}
      {followUps.map((f) => (
        <div key={f.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #eee" }}>
          <Link to={`/leads/${f.id}`}>{f.company}</Link>
          <span style={{ color: f.overdue ? "var(--danger)" : "#666" }}>
            {f.overdue ? "Overdue — " : ""}
            {new Date(f.nextFollowUp).toLocaleDateString()}
          </span>
        </div>
      ))}
    </div>
  );
}
