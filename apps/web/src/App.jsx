import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { Shell } from "./components/layout/Shell.jsx";
import { LoginPage } from "./pages/Login.jsx";
import { DashboardPage } from "./pages/Dashboard.jsx";
import { LeadsPage } from "./pages/Leads.jsx";
import { LeadDetailPage } from "./pages/LeadDetail.jsx";
import { ScoutPage } from "./pages/Scout.jsx";
import { SettingsPage } from "./pages/Settings.jsx";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Shell>{children}</Shell>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/leads" element={<ProtectedRoute><LeadsPage /></ProtectedRoute>} />
      <Route path="/leads/:id" element={<ProtectedRoute><LeadDetailPage /></ProtectedRoute>} />
      <Route path="/scout" element={<ProtectedRoute><ScoutPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
