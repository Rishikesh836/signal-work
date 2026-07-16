export function HierarchyNudge({ nudge }) {
  if (!nudge) return null;
  return (
    <div className="hint nudge" style={{ marginBottom: 12 }}>
      💡 {nudge.message}
    </div>
  );
}
