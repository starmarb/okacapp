import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getAppointment, upsertInvoice, getInvoice } from "../api/client";

function formatCurrency(amount) {
  return `$${Number(amount).toFixed(2)}`;
}

// Groups parts for the "Parts Used" table:
// Brand → Part Name → each distinct model, with its serial numbers joined together.
function groupPartsForInvoice(parts) {
  const byBrand = {};
  for (const part of parts) {
    if (!byBrand[part.brand]) byBrand[part.brand] = {};
    if (!byBrand[part.brand][part.name]) byBrand[part.brand][part.name] = [];
    byBrand[part.brand][part.name].push({
      model: part.model_number || "—",
      serials: part.serial_numbers.length > 0 ? part.serial_numbers.join(", ") : "—",
    });
  }

  const rows = [];
  for (const brand of Object.keys(byBrand)) {
    let brandShown = false;
    for (const name of Object.keys(byBrand[brand])) {
      let nameShown = false;
      for (const entry of byBrand[brand][name]) {
        rows.push({
          brand: brandShown ? "" : brand,
          name: nameShown ? "" : name,
          model: entry.model,
          serials: entry.serials,
        });
        brandShown = true;
        nameShown = true;
      }
    }
  }
  return rows;
}

export default function InvoicePage() {
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState(null);
  // Total is intentionally NOT in this state object — it's never typed in,
  // only ever calculated from subtotal + tax, both when previewing and
  // when actually saved.
  const [pricing, setPricing] = useState({
    total_service: "",
    total_parts: "",
    discount: "",
    subtotal: "",
    tax: "",
  });
  const [warrantyExtension, setWarrantyExtension] = useState("");
  const [generated, setGenerated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    async function loadData() {
      const data = await getAppointment(appointmentId);
      setAppointment(data);
      try {
        const existing = await getInvoice(appointmentId);
        setPricing({
          total_service: existing.total_service,
          total_parts: existing.total_parts,
          discount: existing.discount,
          subtotal: existing.subtotal,
          tax: existing.tax,
        });
        setWarrantyExtension(existing.warranty_extension_registered || "");
        setGenerated(true);
      } catch {
        // No invoice yet — start blank.
      }
    }
    loadData();
  }, [appointmentId]);

  function updateField(field, value) {
    setPricing((prev) => ({ ...prev, [field]: value }));
  }

  const calculatedTotal = (Number(pricing.subtotal) || 0) + (Number(pricing.tax) || 0);

  async function handleComplete() {
    setSaving(true);
    try {
      await upsertInvoice(appointmentId, {
        total_service: Number(pricing.total_service) || 0,
        total_parts: Number(pricing.total_parts) || 0,
        discount: Number(pricing.discount) || 0,
        subtotal: Number(pricing.subtotal) || 0,
        tax: Number(pricing.tax) || 0,
        total: calculatedTotal,
        warranty_extension_registered: warrantyExtension,
      });
      setGenerated(true);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  function handlePrintPdf() {
    // Browser print-to-PDF: no extra library needed, and "Save as PDF" is
    // built into every modern browser's print dialog. Print-specific CSS
    // (in App.css, @media print) hides the nav/buttons so only the invoice
    // itself ends up in the PDF.
    window.print();
  }

  if (!appointment) return <p>불러오는 중...</p>;

  const partsWithWarranty = (appointment.parts || []).filter((p) => p.warranty);
  const groupedParts = groupPartsForInvoice(appointment.parts || []);

  return (
    <div className="dashboard-page">
      <h1 className="no-print">인보이스 만들기</h1>
      <p className="invoice-appointment-summary">
        {appointment.name} — {appointment.address} — {appointment.appointment_date}
      </p>

      {!generated && (
        <div className="invoice-input-form no-print">
          <h3>가격 정보 입력</h3>
          {[
            ["total_service", "Total Service"],
            ["total_parts", "Total Parts"],
            ["discount", "Discount"],
            ["subtotal", "Subtotal"],
            ["tax", "Tax"],
          ].map(([field, label]) => (
            <div className="invoice-field-row" key={field}>
              <label>{label}</label>
              <input
                type="number"
                step="0.01"
                value={pricing[field]}
                onChange={(e) => updateField(field, e.target.value)}
              />
            </div>
          ))}

          <div className="invoice-field-row invoice-calculated-total">
            <label>Total (자동 계산)</label>
            <span>{formatCurrency(calculatedTotal)}</span>
          </div>

          <div className="invoice-field-row">
            <label>Warranty Extension Registered</label>
            <input
              type="text"
              value={warrantyExtension}
              onChange={(e) => setWarrantyExtension(e.target.value)}
            />
          </div>

          <div className="save-row">
            <button className="primary-button" onClick={handleComplete} disabled={saving}>
              완료
            </button>
            {savedMessage && <span className="saved-message">저장됨! ✓</span>}
          </div>
        </div>
      )}

      {generated && (
        <div className="generated-invoice">
          <div className="invoice-actions no-print">
            <button className="secondary-button" onClick={() => setGenerated(false)}>
              가격 정보 수정
            </button>
            <button className="secondary-button" onClick={handlePrintPdf}>
              PDF로 내보내기
            </button>
            {savedMessage && <span className="saved-message">저장됨! ✓</span>}
          </div>

          <h2>Parts Used</h2>
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Brand</th>
                <th>Part Name</th>
                <th>Model No.</th>
                <th>Serial No.</th>
              </tr>
            </thead>
            <tbody>
              {groupedParts.map((row, i) => (
                <tr key={i}>
                  <td>{row.brand}</td>
                  <td>{row.name}</td>
                  <td>{row.model}</td>
                  <td>{row.serials}</td>
                </tr>
              ))}
              {groupedParts.length === 0 && (
                <tr>
                  <td colSpan={4}>—</td>
                </tr>
              )}
            </tbody>
          </table>

          <h2>Scope of Work</h2>
          <p className="invoice-scope-text">{appointment.work_done || "—"}</p>

          <h2>Warranty</h2>
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Part Name</th>
                <th>Warranty</th>
              </tr>
            </thead>
            <tbody>
              {partsWithWarranty.map((part) => (
                <tr key={part.id}>
                  <td>{part.name}</td>
                  <td>{part.warranty}</td>
                </tr>
              ))}
              {partsWithWarranty.length === 0 && (
                <tr>
                  <td colSpan={2}>—</td>
                </tr>
              )}
            </tbody>
          </table>
          <p className="warranty-extension-line">
            Warranty Extension Registered: {warrantyExtension || "—"}
          </p>

          <h2>Pricing</h2>
          <table className="invoice-table">
            <tbody>
              <tr>
                <td>Total Service</td>
                <td>{formatCurrency(pricing.total_service)}</td>
              </tr>
              <tr>
                <td>Total Parts</td>
                <td>{formatCurrency(pricing.total_parts)}</td>
              </tr>
              <tr>
                <td>Discount</td>
                <td>{formatCurrency(pricing.discount)}</td>
              </tr>
              <tr>
                <td>Subtotal</td>
                <td>{formatCurrency(pricing.subtotal)}</td>
              </tr>
              <tr>
                <td>Tax</td>
                <td>{formatCurrency(pricing.tax)}</td>
              </tr>
              <tr className="invoice-total-row">
                <td>Total</td>
                <td>{formatCurrency(calculatedTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
