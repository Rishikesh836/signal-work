import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "../components/layout/PageHeader.jsx";
import { ScoutSearch } from "../components/scout/ScoutSearch.jsx";
import { ScoutResultCard } from "../components/scout/ScoutResultCard.jsx";
import { scoutSearch, scoutAccept } from "../api/leads.js";

const PAGE_SIZE = 10;

const CLOSED_FILTERS = [
  { id: "open", label: "Open postings only" },
  { id: "all", label: "All (open + closed)" },
  { id: "closed", label: "Closed / no longer applicable only" },
];

export function ScoutPage() {
  const [results, setResults] = useState([]);
  const [accepted, setAccepted] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [closedFilter, setClosedFilter] = useState("open");
  const [page, setPage] = useState(1);

  async function handleSearch(query, platforms, timeRange, resultCount) {
    setLoading(true);
    setError(null);
    setResults([]);
    setAccepted({});
    setPage(1);
    try {
      const data = await scoutSearch(query, platforms, timeRange, resultCount);
      setResults(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(result) {
    await scoutAccept(result);
    setAccepted((a) => ({ ...a, [result.sourceUrl]: true }));
  }

  const filteredResults = useMemo(() => {
    if (closedFilter === "all") return results;
    if (closedFilter === "closed") return results.filter((r) => r.isClosed);
    return results.filter((r) => !r.isClosed);
  }, [results, closedFilter]);

  useEffect(() => {
    setPage(1);
  }, [closedFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredResults.length / PAGE_SIZE));
  const pageResults = filteredResults.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <PageHeader title="AI Lead Scout" />
      <ScoutSearch onSearch={handleSearch} loading={loading} />
      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}

      {results.length > 0 && (
        <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <label style={{ marginTop: 0 }}>Show</label>
            <select value={closedFilter} onChange={(e) => setClosedFilter(e.target.value)}>
              {CLOSED_FILTERS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
            </select>
          </div>
          <div style={{ color: "#666" }}>{filteredResults.length} result(s)</div>
        </div>
      )}

      {pageResults.map((r) => (
        <ScoutResultCard
          key={r.sourceUrl}
          result={r}
          accepted={!!accepted[r.sourceUrl]}
          onAccept={() => handleAccept(r)}
        />
      ))}

      {filteredResults.length > PAGE_SIZE && (
        <div style={{ display: "flex", justifyContent: "center", gap: 12, alignItems: "center", marginTop: 8 }}>
          <button className="btn secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button className="btn secondary" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
