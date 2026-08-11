// Colors matched to the Figma design — each service type gets its own tint.
const SERVICE_COLORS = {
  수리: { bg: "rgba(153, 182, 201, 0.1)", border: "#99b6c9" },
  설치: { bg: "rgba(154, 184, 149, 0.1)", border: "#9ab895" },
  공사: { bg: "rgba(201, 167, 153, 0.1)", border: "#c9a799" },
};

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

export default function AppointmentCard({ appointment, onClick }) {
  const colors = SERVICE_COLORS[appointment.service_type] || {
    bg: "#f5f5f5",
    border: "#ddd",
  };

  return (
    <div
      className="appointment-card"
      style={{ backgroundColor: colors.bg, borderColor: colors.border }}
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