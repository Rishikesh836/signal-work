import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { login as loginApi, signup as signupApi } from "../api/auth.js";

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("demo@signalwork.io");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = mode === "login" ? await loginApi(email, password) : await signupApi(email, password);
      login(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--paper)" }}>
      <form className="card" onSubmit={handleSubmit} style={{ width: 360 }}>
        <h1>Signalwork</h1>
        <p style={{ color: "#666", marginTop: 0 }}>Lead outreach & tracking</p>

        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        {error && <p style={{ color: "var(--danger)" }}>{error}</p>}

        <button className="btn" type="submit" disabled={loading} style={{ width: "100%", marginTop: 20 }}>
          {loading ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
        </button>

        <button
          type="button"
          className="btn secondary"
          style={{ width: "100%", marginTop: 8, background: "transparent", border: "none", color: "var(--accent)" }}
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login" ? "Need an account? Sign up" : "Have an account? Log in"}
        </button>
      </form>
    </div>
  );
}
