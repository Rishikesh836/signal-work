import { useRef, useState } from "react";
import { PageHeader } from "../components/layout/PageHeader.jsx";
import { importLeadsCsv, downloadLeadsCsv } from "../api/leads.js";

export function SettingsPage() {
  const fileInputRef = useRef(null);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    setImportResult(null);
    try {
      const result = await importLeadsCsv(file);
      setImportResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleExport() {
    setBusy(true);
    setError(null);
    try {
      await downloadLeadsCsv();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Settings" />

      <div className="card">
        <h3>Import leads from CSV</h3>
        <p style={{ color: "#666" }}>
          Columns: company, contact, designation, email, phone, profile_url, source_url, industry, source,
          tier, signals (semicolon-separated), and optional recruiter_name/email/phone/profile_url,
          hr_name/email/phone/profile_url.
        </p>
        <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImport} disabled={busy} />
        {importResult && (
          <div style={{ marginTop: 12 }}>
            <p>Imported {importResult.imported} lead(s). {importResult.failed} failed.</p>
            {importResult.errors?.length > 0 && (
              <ul>
                {importResult.errors.map((e, i) => (
                  <li key={i} style={{ color: "var(--danger)" }}>
                    Row {e.row} ({e.company}): {e.errors.join("; ")}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <h3>Export leads to CSV</h3>
        <p style={{ color: "#666" }}>
          Includes profile/source links, other people at the company, interaction count, and last interaction date.
        </p>
        <button className="btn" onClick={handleExport} disabled={busy}>Export CSV</button>
      </div>

      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
    </div>
  );
}
