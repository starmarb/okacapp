import { useRef } from "react";
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

const LONG_PRESS_MS = 500; // how long to hold before it counts as a long-press

export default function AppointmentCard({ appointment, onClick, onLongPress }) {
  const borderColor = SERVICE_COLORS[appointment.service_type] || "#ddd";
  const backgroundColor = hexToTintedBackground(borderColor);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(appointment.address)}`;

  // A tap fires `onClick` (go to details); a hold fires `onLongPress` (edit).
  const timerRef = useRef(null);
  const longPressFired = useRef(false);

  function startPress() {
    longPressFired.current = false;
    timerRef.current = setTimeout(() => {
      longPressFired.current = true;
      onLongPress?.();
    }, LONG_PRESS_MS);
  }

  function cancelPress() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function handleClick() {
    // If the hold already triggered the edit modal, swallow the trailing click
    // so we don't also navigate to the details page.
    if (longPressFired.current) {
      longPressFired.current = false;
      return;
    }
    onClick?.();
  }

  return (
    <div
      className="appointment-card"
      style={{ backgroundColor, borderColor }}
      onClick={handleClick}
      onTouchStart={startPress}
      onTouchEnd={cancelPress}
      onTouchMove={cancelPress}
      onMouseDown={startPress}
      onMouseUp={cancelPress}
      onMouseLeave={cancelPress}
      onContextMenu={(e) => e.preventDefault()} // suppress the mobile long-press menu
    >
      <div className="appointment-card-header">
        <strong>{formatTime(appointment.appointment_date)}</strong>
        <span className="service-type">{appointment.service_type}</span>
      </div>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="address-link"
        onClick={(e) => e.stopPropagation()} // don't also trigger the card's navigate-to-detail
      >
        {appointment.address}
      </a>
      <p>{appointment.phone}</p>
    </div>
  );
}