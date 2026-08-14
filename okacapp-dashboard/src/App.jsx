import { Routes, Route, Link, useLocation } from "react-router-dom";
import AppointmentsPage from "./pages/AppointmentsPage";
import InvoicePage from "./pages/InvoicePage";
import CalendarPage from "./pages/CalendarPage";
import "./App.css";

export default function App() {
  const location = useLocation();

  return (
    <div className="dashboard-shell">
      <header className="dashboard-topbar no-print">
        <h1 className="dashboard-brand">Blue Collar Business Suite</h1>
      </header>

      <nav className="dashboard-tabs no-print">
        <Link to="/" className={location.pathname === "/" ? "active" : ""}>
          예약 관리
        </Link>
        <Link to="/calendar" className={location.pathname === "/calendar" ? "active" : ""}>
          전체 일정
        </Link>
      </nav>

      <main className="dashboard-main">
        <Routes>
          <Route path="/" element={<AppointmentsPage />} />
          <Route path="/invoice/:appointmentId" element={<InvoicePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
        </Routes>
      </main>
    </div>
  );
}
