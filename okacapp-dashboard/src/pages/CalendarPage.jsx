import { useState, useEffect } from "react";
import { getAppointments, updateAppointment } from "../api/client";
import { SERVICE_COLORS } from "../components/serviceColors";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const STATUS_OPTIONS = ["scheduled", "in_progress", "completed", "cancelled", "rescheduled"];

function dateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Builds a 6-week grid (42 days) covering the given month, including the
// tail end of the previous month and start of the next, so every week row
// is always full — this is the standard month-calendar layout pattern.
function buildMonthGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay(); // 0 = Sunday
  const gridStart = new Date(year, month, 1 - startOffset);

  const days = [];
  for (let i = 0; i < 42; i++) {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + i);
    days.push(day);
  }
  return days;
}

export default function CalendarPage() {
  const [viewDate, setViewDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);

  async function loadAppointments() {
    const all = await getAppointments();
    setAppointments(all);
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const grid = buildMonthGrid(year, month);
  const todayKey = dateKey(new Date());

  const appointmentsByDay = {};
  for (const appt of appointments) {
    const key = appt.appointment_date.slice(0, 10); // "2026-08-11T10:00" -> "2026-08-11"
    if (!appointmentsByDay[key]) appointmentsByDay[key] = [];
    appointmentsByDay[key].push(appt);
  }

  const selectedDayAppointments = selectedDay ? appointmentsByDay[dateKey(selectedDay)] || [] : [];

  return (
    <div className="dashboard-page">
      <h1>전체 일정</h1>

      <div className="calendar-nav">
        <button onClick={() => setViewDate(new Date(year, month - 1, 1))}>‹</button>
        <strong>{year}년 {month + 1}월</strong>
        <button onClick={() => setViewDate(new Date(year, month + 1, 1))}>›</button>
        <button className="secondary-button small" onClick={() => setViewDate(new Date())}>
          오늘
        </button>
      </div>

      <div className="calendar-grid">
        {WEEKDAYS.map((day) => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
        {grid.map((day) => {
          const key = dateKey(day);
          const dayAppointments = appointmentsByDay[key] || [];
          const isCurrentMonth = day.getMonth() === month;
          const isToday = key === todayKey;
          const isSelected = selectedDay && dateKey(selectedDay) === key;

          return (
            <div
              key={key}
              className={`calendar-cell ${isCurrentMonth ? "" : "outside-month"} ${
                isToday ? "is-today" : ""
              } ${isSelected ? "is-selected" : ""}`}
              onClick={() => setSelectedDay(day)}
            >
              <span className="calendar-date-number">{day.getDate()}</span>
              <div className="calendar-bars">
                {dayAppointments.slice(0, 6).map((appt) => (
                  <div
                    key={appt.id}
                    className="calendar-bar"
                    style={{ backgroundColor: SERVICE_COLORS[appt.service_type] || "#999" }}
                    title={`${appt.appointment_date.slice(11, 16)} — ${appt.name} — ${appt.address} (${appt.status})`}
                  />
                ))}
                {dayAppointments.length > 6 && <span className="calendar-more">+{dayAppointments.length - 6}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDay && (
        <div className="calendar-day-panel">
          <h3>{dateKey(selectedDay)}</h3>
          {selectedDayAppointments.length === 0 && <p className="empty-state">예약 없음</p>}
          {selectedDayAppointments.map((appt) => (
            <div key={appt.id} className="calendar-appointment-item" onClick={() => setEditingAppointment(appt)}>
              <span
                className="calendar-dot"
                style={{ backgroundColor: SERVICE_COLORS[appt.service_type] || "#999" }}
              />
              {appt.appointment_date.slice(11, 16)} — {appt.name} ({appt.status})
            </div>
          ))}
        </div>
      )}

      {editingAppointment && (
        <EditAppointmentPanel
          appointment={editingAppointment}
          onClose={() => setEditingAppointment(null)}
          onSaved={() => {
            setEditingAppointment(null);
            loadAppointments();
          }}
        />
      )}
    </div>
  );
}

function EditAppointmentPanel({ appointment, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: appointment.name,
    address: appointment.address || "",
    phone: appointment.phone || "",
    service_type: appointment.service_type || "",
    status: appointment.status,
    appointment_date: appointment.appointment_date,
  });
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateAppointment(appointment.id, form);
      setSavedMessage(true);
      setTimeout(() => {
        setSavedMessage(false);
        onSaved();
      }, 1200);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-panel">
        <div className="modal-header">
          <h2>예약 수정</h2>
          <button className="icon-button-small" onClick={onClose}>
            ×
          </button>
        </div>

        <label>고객명</label>
        <input type="text" value={form.name} onChange={(e) => updateField("name", e.target.value)} />

        <label>주소</label>
        <input type="text" value={form.address} onChange={(e) => updateField("address", e.target.value)} />

        <label>전화번호</label>
        <input type="text" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />

        <label>서비스 종류</label>
        <select value={form.service_type} onChange={(e) => updateField("service_type", e.target.value)}>
          <option value="수리">수리</option>
          <option value="설치">설치</option>
          <option value="공사">공사</option>
          <option value="기타">기타</option>
        </select>

        <label>날짜 및 시간</label>
        <input
          type="datetime-local"
          value={form.appointment_date}
          onChange={(e) => updateField("appointment_date", e.target.value)}
        />
        <p className="edit-note">
          날짜를 변경하면 상태가 자동으로 "rescheduled"로 바뀝니다 — 다른 상태를 선택하지 않는 한.
        </p>

        <label>상태</label>
        <select value={form.status} onChange={(e) => updateField("status", e.target.value)}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <button className="primary-button" onClick={handleSave} disabled={saving}>
          저장
        </button>
        {savedMessage && <span className="saved-message">저장됨! ✓</span>}
      </div>
    </div>
  );
}
