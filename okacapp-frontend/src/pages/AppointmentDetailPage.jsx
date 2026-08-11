import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAppointment, updateAppointment } from "../api/client";
import AddPartForm from "../components/AddPartForm";

// Exact hex values as specified — used for both the schedule list cards
// and this detail page's badge, so the whole app stays consistent.
export const SERVICE_COLORS = {
  수리: "#99B6C9",
  설치: "#A5C0A1",
  공사: "#C999AC",
  기타: "#C9A799",
};

// Formats "2026-08-11T10:00" into "8월 11일 (화) 오전 10:00" —
// much easier to scan at a glance than the raw ISO string.
function formatDateTime(dateString) {
  const date = new Date(dateString);
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = weekdays[date.getDay()];
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = hours >= 12 ? "오후" : "오전";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${month}월 ${day}일 (${weekday}) ${period} ${hours}:${minutes}`;
}

export default function AppointmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [workDone, setWorkDone] = useState("");
  // null = no panel open, "add" = adding a new part, or the part object being edited
  const [activePanel, setActivePanel] = useState(null);

  async function loadAppointment() {
    const data = await getAppointment(id);
    setAppointment(data);
    setWorkDone(data.work_done || "");
  }

  useEffect(() => {
    loadAppointment();
  }, [id]);

  async function handleComplete() {
    await updateAppointment(id, {
      status: "completed",
      work_done: workDone,
    });
    navigate("/");
  }

  if (!appointment) return <p>불러오는 중...</p>;

  const accentColor = SERVICE_COLORS[appointment.service_type] || "#858585";
  const hasPhotos = (appointment.photos || []).length > 0;

  return (
    <div className="page detail-page">
      <div className="detail-header" style={{ borderBottomColor: accentColor }}>
        <div>
          <strong className="detail-time">{formatDateTime(appointment.appointment_date)}</strong>
          <p className="detail-name">{appointment.name}</p>
          <p>{appointment.address}</p>
          <p>{appointment.phone}</p>
        </div>
        <span className="service-badge" style={{ borderColor: accentColor, color: accentColor }}>
          {appointment.service_type}
        </span>
      </div>

      <h2>진행한 작업</h2>
      <textarea
        className="work-done-textarea"
        placeholder="텍스트로 입력..."
        value={workDone}
        onChange={(e) => setWorkDone(e.target.value)}
        // No maxLength set — technicians can write as much as they need.
      />

      <hr className="section-divider" />

      <h2>사용된 부품</h2>
      {(appointment.parts || []).length === 0 && (
        <p className="empty-state">추가된 부품이 없습니다.</p>
      )}
      {(appointment.parts || []).map((part) => (
        <div key={part.id} className="used-part-box">
          <div className="used-part-header">
            <span>
              <strong>{part.brand}</strong> {part.name} <span className="part-count">{part.quantity}ea</span>
            </span>
            <button className="edit-button" type="button" onClick={() => setActivePanel(part)}>
              편집
            </button>
          </div>
          {part.serial_numbers.map((serial) => (
            <p key={serial} className="serial-number-display">
              {serial}
            </p>
          ))}
        </div>
      ))}

      {activePanel ? (
        <AddPartForm
          appointmentId={id}
          editingPart={activePanel === "add" ? null : activePanel}
          onClose={() => setActivePanel(null)}
          onAdded={() => {
            setActivePanel(null);
            loadAppointment();
          }}
        />
      ) : (
        <button className="add-part-trigger" onClick={() => setActivePanel("add")}>
          +
        </button>
      )}

      <hr className="section-divider" />

      <button className="primary-button complete-button" onClick={handleComplete}>
        완료
      </button>

      {hasPhotos && (
        <>
          <h2>추가한 이미지</h2>
          <div className="photo-placeholder-row">
            {appointment.photos.map((photo) => (
              <div key={photo.id} className="photo-placeholder" />
            ))}
          </div>
        </>
      )}
    </div>
  );
}