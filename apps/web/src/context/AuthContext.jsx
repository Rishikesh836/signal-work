import { createContext, useContext, useEffect, useState } from "react";
import { getToken, setToken as persistToken } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getToken());
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("signalwork_user");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  function login({ token, user }) {
    persistToken(token);
    localStorage.setItem("signalwork_user", JSON.stringify(user));
    setTokenState(token);
    setUser(user);
  }

  function logout() {
    persistToken(null);
    localStorage.removeItem("signalwork_user");
    setTokenState(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
