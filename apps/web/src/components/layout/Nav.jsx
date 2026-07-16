import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const LINKS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/leads", label: "Leads" },
  { to: "/scout", label: "Scout" },
  { to: "/settings", label: "Settings" },
];

export function Nav() {
  const { user, logout } = useAuth();

  return (
    <nav className="app-nav">
      <h3 style={{ marginBottom: 20 }}>Signalwork</h3>
      {LINKS.map((link) => (
        <NavLink key={link.to} to={link.to} end={link.end}>
          {link.label}
        </NavLink>
      ))}
      <div style={{ marginTop: 32, fontSize: "0.85em" }}>
        <div style={{ marginBottom: 8, color: "#666" }}>{user?.email}</div>
        <button className="btn secondary" onClick={logout}>Log out</button>
      </div>
    </nav>
  );
}
