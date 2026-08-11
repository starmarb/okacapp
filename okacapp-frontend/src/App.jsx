import { Routes, Route } from "react-router-dom";
import SchedulePage from "./pages/SchedulePage";
import AppointmentDetailPage from "./pages/AppointmentDetailPage";
import "./App.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SchedulePage />} />
      <Route path="/appointments/:id" element={<AppointmentDetailPage />} />
    </Routes>
  );
}
