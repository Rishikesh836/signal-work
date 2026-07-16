import { Link } from "react-router-dom";
import { Badge } from "../shared/Badge.jsx";
import { SignalChip } from "../shared/SignalChip.jsx";

export function LeadCard({ lead }) {
  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h3 style={{ marginBottom: 4 }}>
            <Link to={`/leads/${lead.id}`}>{lead.company}</Link>
          </h3>
          <div style={{ color: "#666" }}>
            {lead.contact} {lead.designation ? `— ${lead.designation}` : ""}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <Badge>Tier {lead.tier}</Badge>{" "}
          <Badge>{lead.status}</Badge>
        </div>
      </div>
      <div style={{ marginTop: 8 }}>
        {lead.signals.map((s, i) => (
          <SignalChip key={i}>{s}</SignalChip>
        ))}
      </div>
    </div>
  );
}
