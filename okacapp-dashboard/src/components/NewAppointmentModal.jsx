import { useState } from "react";
import { createAppointment } from "../api/client";

export default function NewAppointmentModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    service_type: "",
    appointment_date: "",
    address: "",
    phone: "",
    email: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    const newErrors = {};
    if (!form.service_type) newErrors.service_type = "필수 항목입니다";
    if (!form.appointment_date) newErrors.appointment_date = "필수 항목입니다";
    if (!form.name) newErrors.name = "필수 항목입니다";
    if (!form.address) newErrors.address = "필수 항목입니다";
    if (!form.phone) newErrors.phone = "필수 항목입니다";
    return newErrors;
  }

  async function handleSubmit() {
    const newErrors = validate();
    if (Object.keys(newErrors).length !== 0) {
      setErrors(newErrors);
      return;
    }
    setSubmitting(true);
    try {
      await createAppointment(form);
      onCreated();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-panel">
        <div className="modal-header">
          <h2>새 예약</h2>
          <button className="icon-button-small" onClick={onClose}>
            ×
          </button>
        </div>

        <label>서비스 종류</label>
        <select value={form.service_type} onChange={(e) => updateField("service_type", e.target.value)}>
          <option value="">선택</option>
          <option value="수리">수리</option>
          <option value="설치">설치</option>
          <option value="공사">공사</option>
          <option value="기타">기타</option>
        </select>
        {errors.service_type && <p className="error-text">{errors.service_type}</p>}

        <label>고객명</label>
        <input type="text" value={form.name} onChange={(e) => updateField("name", e.target.value)} />
        {errors.name && <p className="error-text">{errors.name}</p>}

        <label>날짜 및 시간</label>
        <input
          type="datetime-local"
          value={form.appointment_date}
          onChange={(e) => updateField("appointment_date", e.target.value)}
        />
        {errors.appointment_date && <p className="error-text">{errors.appointment_date}</p>}

        <label>주소</label>
        <input type="text" value={form.address} onChange={(e) => updateField("address", e.target.value)} />
        {errors.address && <p className="error-text">{errors.address}</p>}

        <label>전화번호</label>
        <input type="text" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
        {errors.phone && <p className="error-text">{errors.phone}</p>}

        <label>이메일 (선택)</label>
        <input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} />

        <button className="primary-button" onClick={handleSubmit} disabled={submitting}>
          예약 추가
        </button>
      </div>
    </div>
  );
}
