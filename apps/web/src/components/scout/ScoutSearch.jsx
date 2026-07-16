import { useState } from "react";

export function ScoutSearch({ onSearch, loading }) {
  const [query, setQuery] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onSearch(query);
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
      <button className="btn" type="submit" disabled={loading} style={{ marginTop: 12 }}>
        {loading ? "Searching…" : "Search"}
      </button>
    </form>
  );
}
