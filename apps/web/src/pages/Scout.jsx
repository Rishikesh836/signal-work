import { useState } from "react";
import { PageHeader } from "../components/layout/PageHeader.jsx";
import { ScoutSearch } from "../components/scout/ScoutSearch.jsx";
import { ScoutResultCard } from "../components/scout/ScoutResultCard.jsx";
import { scoutSearch, scoutAccept } from "../api/leads.js";

export function ScoutPage() {
  const [results, setResults] = useState([]);
  const [accepted, setAccepted] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSearch(query) {
    setLoading(true);
    setError(null);
    setResults([]);
    setAccepted({});
    try {
      const data = await scoutSearch(query);
      setResults(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(result, index) {
    await scoutAccept(result);
    setAccepted((a) => ({ ...a, [index]: true }));
  }

  return (
    <div>
      <PageHeader title="AI Lead Scout" />
      <ScoutSearch onSearch={handleSearch} loading={loading} />
      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
      {results.map((r, i) => (
        <ScoutResultCard key={i} result={r} accepted={!!accepted[i]} onAccept={() => handleAccept(r, i)} />
      ))}
    </div>
  );
}
