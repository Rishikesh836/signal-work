import { Badge } from "../shared/Badge.jsx";
import { SignalChip } from "../shared/SignalChip.jsx";

export function ScoutResultCard({ result, onAccept, accepted }) {
  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3>{result.company}</h3>
        <Badge>Tier {result.tier}</Badge>
      </div>
      {result.industry && <p style={{ color: "#666" }}>{result.industry}</p>}
      <SignalChip>{result.signal}</SignalChip>
      {result.note && <p style={{ fontSize: "0.85em", color: "var(--signal)" }}>{result.note}</p>}
      {result.sourceUrl && (
        <p><a href={result.sourceUrl} target="_blank" rel="noreferrer">Source ↗</a></p>
      )}
      <button className="btn" onClick={onAccept} disabled={accepted}>
        {accepted ? "Added to leads" : "Accept"}
      </button>
    </div>
  );
}
