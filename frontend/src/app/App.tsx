import { Navigate, NavLink, Route, Routes } from "react-router-dom";
import { LoginPage } from "./LoginPage";
import { useDemoAuth } from "./DemoAuth";
import { HealthIndicator } from "../components/HealthIndicator";
import { DashboardPage } from "../features/tasks/DashboardPage";
import { TaskFormPage } from "../features/tasks/TaskFormPage";

export function App() {
  const { isLoggedIn, logout } = useDemoAuth();
  if (!isLoggedIn) return <LoginPage />;
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">MVP foundation</p>
          <NavLink className="brand" to="/">
            Smart Task Tracker
          </NavLink>
        </div>
        <div className="header-actions"><HealthIndicator /><button className="text-button" onClick={logout} type="button">Sign out</button></div>
      </header>
      <main className="app-content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/tasks/new" element={<TaskFormPage mode="create" />} />
          <Route path="/tasks/:id/edit" element={<TaskFormPage mode="edit" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
