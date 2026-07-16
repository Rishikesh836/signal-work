import { useState } from "react";

const PLATFORMS = [
  { id: "linkedin", label: "LinkedIn" },
  { id: "naukri", label: "Naukri.com" },
  { id: "other", label: "Other websites (open web — company sites, news, Indeed, Glassdoor, etc.)" },
];

const TIME_RANGES = [
  { id: "week", label: "Past week" },
  { id: "month", label: "Past month" },
  { id: "year", label: "Past year" },
  { id: "any", label: "Any time" },
];

const RESULT_COUNTS = [10, 20, 30];

export function ScoutSearch({ onSearch, loading }) {
  const [query, setQuery] = useState("");
  const [platforms, setPlatforms] = useState(["linkedin", "naukri"]);
  const [timeRange, setTimeRange] = useState("month");
  const [resultCount, setResultCount] = useState(20);

  function togglePlatform(id) {
    setPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSearch(query, platforms, timeRange === "any" ? undefined : timeRange, resultCount);
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <label>Describe your target lead profile</label>
      <textarea
        rows={3}
        placeholder="e.g. mid-size manufacturing companies in the Midwest hiring for plant reliability or predictive maintenance roles"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        required
      />

      <label>Search on</label>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {PLATFORMS.map((p) => (
          <label key={p.id} style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400 }}>
            <input
              type="checkbox"
              style={{ width: "auto" }}
              checked={platforms.includes(p.id)}
              onChange={() => togglePlatform(p.id)}
            />
            {p.label}
          </label>
        ))}
      </div>

      <label>How recent</label>
      <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
        {TIME_RANGES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
      </select>
      <p style={{ fontSize: "0.8em", color: "#666", marginTop: 4 }}>
        Narrower windows favor freshly posted roles and news over stale listings.
      </p>

      <label>Number of results</label>
      <select value={resultCount} onChange={(e) => setResultCount(Number(e.target.value))}>
        {RESULT_COUNTS.map((n) => <option key={n} value={n}>{n}</option>)}
      </select>

      <button className="btn" type="submit" disabled={loading || platforms.length === 0} style={{ marginTop: 12 }}>
        {loading ? "Searching…" : "Search"}
      </button>
    </form>
  );
}
