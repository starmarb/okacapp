import { useState } from "react";
import { createPart, addPartToAppointment } from "../api/client";

const BRANDS = ["Carrier", "Lennox", "Trane"];

export default function AddPartModal({ appointmentId, onClose, onAdded }) {
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // NOTE: serial number capture (부품 추가's 시리얼 넘버 field) isn't wired up yet —
  // it maps to POST /parts/{id}/instances, a separate call after the part exists.
  // Left out of this first pass to keep the modal simple; easy to add once the
  // rest of the flow is confirmed working.

  async function handleSubmit() {
    if (!brand || !name) return;
    setSubmitting(true);
    try {
      const part = await createPart({ brand, name });
      await addPartToAppointment(appointmentId, { part_id: part.id, quantity });
      onAdded();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-panel">
        <div className="modal-header">
          <h2>부품 추가</h2>
          <button className="icon-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="brand-selector">
          {BRANDS.map((b) => (
            <button
              key={b}
              className={`brand-chip ${brand === b ? "selected" : ""}`}
              onClick={() => setBrand(b)}
            >
              {b}
            </button>
          ))}
        </div>

        <div className="part-name-row">
          <input
            type="text"
            placeholder="파트 이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {/* Camera capture for serial number photo — deferred until AWS storage is set up */}

        <button className="primary-button" onClick={handleSubmit} disabled={submitting}>
          추가하기 ✓
        </button>
      </div>
    </div>
  );
}
