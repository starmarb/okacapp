import { useState } from "react";
import { createAppointment } from "../api/client";

export default function AddAppointmentModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    service_type: "",
    appointment_date: "",
    address: "",
    phone: "",
    email: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }


  function validate() {
    const newErrors = {};
    if (!form.service_type) {
      newErrors.service_type = "필수 항목입니다";
    }
    if (!form.appointment_date) {
      newErrors.appointment_date = "필수 항목입니다";
    }
    if (!form.name) {
      newErrors.name = "필수 항목입니다";
    }
    if (!form.address) {
      newErrors.address = "필수 항목입니다";
    }
    if (!form.phone) {
      newErrors.phone = "필수 항목입니다";
    }

    return newErrors;
  }

  async function handleSubmit() {
    const newErrors = validate();
    if (Object.keys(newErrors).length !== 0) {
      setErrors(newErrors);
      return setSubmitting(false);
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
          <h2>일정 추가</h2>
          <button className="icon-button" onClick={onClose}>
            ×
          </button>
        </div>

        <select value={form.service_type} onChange={(e) => updateField("service_type", e.target.value)}>
          <option value="">서비스</option>
          <option value="수리">수리</option>
          <option value="설치">설치</option>
          <option value="공사">공사</option>
          <option value="기타">기타</option>
        </select>
        {errors.service_type && <p className="error-text">{errors.service_type}</p>}

        <input
          type="text"
          placeholder="고객명"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
        />
        {errors.name && <p className="error-text">{errors.name}</p>}

        <input
          type="datetime-local"
          placeholder="날짜 및 시간"
          value={form.appointment_date}
          onChange={(e) => updateField("appointment_date", e.target.value)}
        />
        {errors.appointment_date && <p className="error-text">{errors.appointment_date}</p>}

        <h3>연락처</h3>
        <input
          type="text"
          placeholder="주소"
          value={form.address}
          onChange={(e) => updateField("address", e.target.value)}
        />
        {errors.address && <p className="error-text">{errors.address}</p>}
        <input
          type="text"
          placeholder="전화번호"
          value={form.phone}
          onChange={(e) => updateField("phone", e.target.value)}
        />
        {errors.phone && <p className="error-text">{errors.phone}</p>}
        <input
          type="email"
          placeholder="이메일"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
        />

        <button className="primary-button" onClick={handleSubmit} disabled={submitting}>
          추가하기 ✓
        </button>
      </div>
    </div>
  );
}