import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAppointments, getAppointment, updatePart, getPhotoUrl } from "../api/client";
import NewAppointmentModal from "../components/NewAppointmentModal";

function todayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState(todayString());
  const [appointments, setAppointments] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const navigate = useNavigate();

  async function loadAppointments() {
    const all = await getAppointments();
    setAppointments(all.filter((a) => a.appointment_date.startsWith(selectedDate)));
  }

  useEffect(() => {
    loadAppointments();
  }, [selectedDate]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>예약 관리</h1>
        <div className="dashboard-header-actions">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button className="primary-button" onClick={() => setShowNewAppointment(true)}>
            + 새 예약
          </button>
        </div>
      </div>

      {appointments.length === 0 && <p className="empty-state">이 날짜에 예약이 없습니다.</p>}

      <div className="appointment-list">
        {appointments.map((appt) => (
          <AppointmentRow
            key={appt.id}
            appointmentId={appt.id}
            summary={appt}
            expanded={expandedId === appt.id}
            onToggle={() => setExpandedId(expandedId === appt.id ? null : appt.id)}
            onMakeInvoice={() => navigate(`/invoice/${appt.id}`)}
          />
        ))}
      </div>

      {showNewAppointment && (
        <NewAppointmentModal
          onClose={() => setShowNewAppointment(false)}
          onCreated={() => {
            setShowNewAppointment(false);
            loadAppointments();
          }}
        />
      )}
    </div>
  );
}

function AppointmentRow({ appointmentId, summary, expanded, onToggle, onMakeInvoice }) {
  const [detail, setDetail] = useState(null);
  const [photoUrls, setPhotoUrls] = useState({});

  useEffect(() => {
    if (!expanded) return;
    async function loadDetail() {
      const data = await getAppointment(appointmentId);
      setDetail(data);
      // Photos are stored as keys, not direct URLs — fetch a signed URL per photo.
      const urls = {};
      for (const photo of data.photos || []) {
        const { url } = await getPhotoUrl(photo.id);
        urls[photo.id] = url;
      }
      setPhotoUrls(urls);
    }
    loadDetail();
  }, [expanded, appointmentId]);

  async function refreshDetail() {
    const data = await getAppointment(appointmentId);
    setDetail(data);
  }

  return (
    <div className="dashboard-appointment-row">
      <div className="dashboard-appointment-summary" onClick={onToggle}>
        <div>
          <strong>{summary.appointment_date}</strong>
          <span className="dashboard-status-tag">{summary.status}</span>
        </div>
        <p>{summary.name} — {summary.address}</p>
      </div>

      {expanded && detail && (
        <div className="dashboard-appointment-detail">
          <h3>진행한 작업 (기술자 작성)</h3>
          <p className="readonly-text">{detail.work_done || "작성된 내용 없음"}</p>

          <h3>사용된 부품 (수정 가능)</h3>
          {(detail.parts || []).map((part) => (
            <EditablePartRow key={part.id} part={part} onSaved={refreshDetail} />
          ))}
          {(detail.parts || []).length === 0 && <p className="empty-state">사용된 부품 없음</p>}

          <h3>첨부 이미지</h3>
          {(detail.photos || []).length === 0 && <p className="empty-state">첨부된 이미지 없음</p>}
          <div className="dashboard-photo-row">
            {(detail.photos || []).map((photo) => (
              <img
                key={photo.id}
                src={photoUrls[photo.id]}
                alt="현장 사진"
                className="dashboard-photo-thumb"
              />
            ))}
          </div>

          <button className="primary-button" onClick={onMakeInvoice}>
            인보이스 만들기
          </button>
        </div>
      )}
    </div>
  );
}

function EditablePartRow({ part, onSaved }) {
  const [modelNumber, setModelNumber] = useState(part.model_number || "");
  const [warranty, setWarranty] = useState(part.warranty || "");
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updatePart(part.id, { model_number: modelNumber, warranty });
      onSaved();
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="editable-part-row">
      <div className="editable-part-header">
        <strong>{part.brand}</strong> {part.name} <span className="part-count">{part.quantity}ea</span>
      </div>
      {part.serial_numbers.length > 0 && (
        <p className="readonly-text small">SN: {part.serial_numbers.join(", ")}</p>
      )}
      <div className="editable-part-fields">
        <input
          type="text"
          placeholder="모델번호"
          value={modelNumber}
          onChange={(e) => setModelNumber(e.target.value)}
        />
        <input
          type="text"
          placeholder="보증 정보 (예: 5년 제조사 보증)"
          value={warranty}
          onChange={(e) => setWarranty(e.target.value)}
        />
        <button className="secondary-button small" onClick={handleSave} disabled={saving}>
          저장
        </button>
        {savedMessage && <span className="saved-message">저장됨! ✓</span>}
      </div>
    </div>
  );
}
