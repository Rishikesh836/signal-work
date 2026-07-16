export function DraftTonePicker({ tones, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
      {tones.map((t) => (
        <button
          key={t}
          className={active === t ? "btn" : "btn secondary"}
          onClick={() => onChange(t)}
          type="button"
        >
          {t}
        </button>
      ))}
    </div>
  );
}
