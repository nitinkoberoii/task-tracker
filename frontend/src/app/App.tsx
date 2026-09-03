import { NavLink, Route, Routes } from "react-router-dom";
import { HealthIndicator } from "../components/HealthIndicator";
import { DashboardPage } from "../features/tasks/DashboardPage";
import { TaskFormPage } from "../features/tasks/TaskFormPage";

export function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">MVP foundation</p>
          <NavLink className="brand" to="/">
            Smart Task Tracker
          </NavLink>
        </div>
        <HealthIndicator />
      </header>
      <main className="app-content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/tasks/new" element={<TaskFormPage mode="create" />} />
          <Route path="/tasks/:id/edit" element={<TaskFormPage mode="edit" />} />
        </Routes>
      </main>
    </div>
  );
}
