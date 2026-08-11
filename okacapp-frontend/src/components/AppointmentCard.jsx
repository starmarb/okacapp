import { SERVICE_COLORS } from "../pages/AppointmentDetailPage";

// Formats "2026-08-11T14:30" into "2:30PM" (matches the Figma design's format —
// no space before AM/PM, unlike the browser's default toLocaleTimeString).
function formatTime(dateString) {
  const date = new Date(dateString);
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes}${period}`;
}

// Converts a hex color like "#99B6C9" into a light 10%-opacity background tint.
function hexToTintedBackground(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, 0.1)`;
}

export default function AppointmentCard({ appointment, onClick }) {
  const borderColor = SERVICE_COLORS[appointment.service_type] || "#ddd";
  const backgroundColor = hexToTintedBackground(borderColor);

  return (
    <div
      className="appointment-card"
      style={{ backgroundColor, borderColor }}
      onClick={onClick}
    >
      <div className="appointment-card-header">
        <strong>{formatTime(appointment.appointment_date)}</strong>
        <span className="service-type">{appointment.service_type}</span>
      </div>
      <p>{appointment.address}</p>
      <p>{appointment.phone}</p>
    </div>
  );
}