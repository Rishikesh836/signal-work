import { Badge } from "../shared/Badge.jsx";
import { SignalChip } from "../shared/SignalChip.jsx";

export function ScoutResultCard({ result, onAccept, accepted }) {
  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3>{result.company}</h3>
        <div>
          {result.isClosed && (
            <span className="badge" style={{ background: "var(--signal-soft)", color: "var(--danger)", marginRight: 8 }}>
              Closed / no longer applicable
            </span>
          )}
          <Badge>Tier {result.tier}</Badge>
        </div>
      </div>
      {result.industry && <p style={{ color: "#666" }}>{result.industry}</p>}
      <SignalChip>{result.signal}</SignalChip>
      {result.note && <p style={{ fontSize: "0.85em", color: "var(--signal)" }}>{result.note}</p>}
      {result.sourceUrl && (
        <p>
          <a href={result.sourceUrl} target="_blank" rel="noreferrer">Source ↗</a>
          {result.publishedDate && (
            <span style={{ color: "#666", fontSize: "0.85em" }}> · published {new Date(result.publishedDate).toLocaleDateString()}</span>
          )}
        </p>
      )}
      <button className="btn" onClick={onAccept} disabled={accepted}>
        {accepted ? "Added to leads" : "Accept"}
      </button>
    </div>
  );
}
