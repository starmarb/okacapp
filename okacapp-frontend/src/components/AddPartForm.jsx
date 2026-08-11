import { useState } from "react";
import {
  createPart,
  addPartToAppointment,
  addPartInstance,
  updateAppointmentPartQuantity,
  deleteAppointmentPartInstances,
} from "../api/client";
import carrierLogo from "../assets/brands/carrier.png";
import lennoxLogo from "../assets/brands/lennox.png";
import traneLogo from "../assets/brands/trane.png";
import cameraIcon from "../assets/icons/camera.svg";

const BRANDS = [
  { name: "Trane", logo: traneLogo },
  { name: "Carrier", logo: carrierLogo },
  { name: "Lennox", logo: lennoxLogo },
];

// Pass `editingPart` to switch this form into edit mode: brand/name become
// read-only (since a part is a shared catalog entry other appointments may
// also reference — renaming it here would silently rewrite their history
// too), while quantity and serial numbers stay fully editable, since those
// are specific to this one appointment's usage.
export default function AddPartForm({ appointmentId, editingPart, onClose, onAdded }) {
  const isEditing = Boolean(editingPart);

  const [brand, setBrand] = useState(editingPart?.brand || "");
  const [name, setName] = useState(editingPart?.name || "");
  const [quantity, setQuantity] = useState(editingPart?.quantity || 1);
  const [serialNumbers, setSerialNumbers] = useState(() => {
    if (editingPart) {
      const existing = editingPart.serial_numbers || [];
      const padded = [...existing];
      while (padded.length < editingPart.quantity) padded.push("");
      return padded;
    }
    return [""];
  });
  const [photo, setPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function updateQuantity(newQuantity) {
    setQuantity(newQuantity);
    setSerialNumbers((prev) => {
      const next = [...prev];
      while (next.length < newQuantity) next.push("");
      return next.slice(0, newQuantity);
    });
  }

  function updateSerialNumber(index, value) {
    setSerialNumbers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function fillStateStyle(value) {
    return { backgroundColor: value ? "#fff" : "#eef" };
  }

  async function handleSubmit() {
    if (!brand || !name) return;
    setSubmitting(true);
    try {
      if (isEditing) {
        await updateAppointmentPartQuantity(appointmentId, editingPart.id, quantity);
        await deleteAppointmentPartInstances(appointmentId, editingPart.id);
        for (const serial of serialNumbers) {
          if (serial.trim()) {
            await addPartInstance(editingPart.id, {
              serial_number: serial.trim(),
              appointment_id: Number(appointmentId),
            });
          }
        }
      } else {
        const part = await createPart({ brand, name });
        await addPartToAppointment(appointmentId, { part_id: part.id, quantity });
        for (const serial of serialNumbers) {
          if (serial.trim()) {
            await addPartInstance(part.id, {
              serial_number: serial.trim(),
              appointment_id: Number(appointmentId),
            });
          }
        }
      }
      onAdded();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="add-part-form">
      <div className="add-part-header">
        <h3>{isEditing ? "부품 수정" : "부품 추가"}</h3>
        <button className="icon-button-small" onClick={onClose}>
          ×
        </button>
      </div>

      {isEditing ? (
        <div className="edit-brand-name-row">
          <div className="edit-brand-name-display">
            <strong>{brand}</strong> {name}
            <p className="edit-note">브랜드와 이름은 수정할 수 없습니다.</p>
          </div>
          <label className="camera-button">
            <img src={cameraIcon} alt="사진 촬영" />
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => setPhoto(e.target.files[0])}
              hidden
            />
          </label>
        </div>
      ) : (
        <div className="brand-logo-row">
          {BRANDS.map((b) => (
            <button
              key={b.name}
              className={`brand-logo-chip ${brand === b.name ? "selected" : "dimmed"}`}
              onClick={() => setBrand(b.name)}
              type="button"
            >
              <img src={b.logo} alt={b.name} />
            </button>
          ))}
        </div>
      )}

      <div className="part-name-quantity-row">
        {!isEditing && (
          <input
            type="text"
            placeholder="파트 이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={fillStateStyle(name)}
          />
        )}
        <input
          type="number"
          min="1"
          list="quantity-suggestions"
          value={quantity}
          onChange={(e) => updateQuantity(Math.max(1, Number(e.target.value) || 1))}
          style={isEditing ? { flex: 1 } : undefined}
        />
        <datalist id="quantity-suggestions">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
      </div>

      {serialNumbers.map((serial, index) => (
        <div className="serial-number-row" key={index}>
          <input
            type="text"
            placeholder={quantity > 1 ? `시리얼 넘버 ${index + 1}` : "시리얼 넘버"}
            value={serial}
            onChange={(e) => updateSerialNumber(index, e.target.value)}
            style={fillStateStyle(serial)}
          />
          {!isEditing && index === 0 && (
            <label className="camera-button">
              <img src={cameraIcon} alt="사진 촬영" />
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => setPhoto(e.target.files[0])}
                hidden
              />
            </label>
          )}
        </div>
      ))}

      <button
        className="primary-button add-part-submit"
        onClick={handleSubmit}
        disabled={submitting || !brand || !name}
      >
        {isEditing ? "수정하기 ✓" : "추가하기 ✓"}
      </button>
    </div>
  );
}