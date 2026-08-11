// Base URL for the FastAPI backend. During local dev this points at your
// uvicorn server. Change this when you deploy the backend somewhere real.
const BASE_URL = "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ---------- Appointments ----------

export function getAppointments() {
  return request("/appointments");
}

export function getAppointment(id) {
  return request(`/appointments/${id}`);
}

export function createAppointment(data) {
  return request("/appointments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateAppointment(id, data) {
  return request(`/appointments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteAppointment(id) {
  return request(`/appointments/${id}`, { method: "DELETE" });
}

// ---------- Parts ----------

export function getParts() {
  return request("/parts");
}

export function createPart(data) {
  return request("/parts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function addPartToAppointment(appointmentId, data) {
  return request(`/appointments/${appointmentId}/parts`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ---------- Photos ----------
// Uses FormData instead of JSON since it's a file upload.

export async function uploadPhoto(appointmentId, file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE_URL}/appointments/${appointmentId}/photos`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail || `Upload failed: ${res.status}`);
  }
  return res.json();
}
