import { Nav } from "./Nav.jsx";

export function Shell({ children }) {
  return (
    <div className="app-shell">
      <Nav />
      <main className="app-main">{children}</main>
    </div>
  );
}
