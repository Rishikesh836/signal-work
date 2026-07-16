export function PageHeader({ title, actions }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <h1>{title}</h1>
      <div>{actions}</div>
    </div>
  );
}
