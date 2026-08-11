import { useState, useEffect } from "react";
import { getAppointments } from "../api/client";
import AddAppointmentModal from "../components/AddAppointmentModal";

export default function SchedulePage() {
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function loadData() {
      const data = await getAppointments();
      setAppointments(data);
    }
    loadData();
  }, []);

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const today = `${year}-${month}-${day}`;

  const todayAppointments = appointments.filter((appt) => {
    return appt.appointment_date.startsWith(today);
  });

  
  return (
    <div className="page">
      <div className="page-header">
        <h1>오늘의 스케줄</h1>
        <button className="icon-button" onClick={() => setShowModal(true)}>+</button>
      </div>

      <div className="card-list">
        {todayAppointments.map((appt) => (
          <div key={appt.id} className="appointment-card">
            <strong>{appt.appointment_date}</strong>
            <p>{appt.address}</p>
            <p>{appt.phone}</p>
            <p>{appt.status}</p>
          </div>
        ))}
      </div>

      {showModal && (
      <AddAppointmentModal
        onClose={() => setShowModal(false)}
        onCreated={() => {
          setShowModal(false);
          async function loadData() {
            const data = await getAppointments();
            setAppointments(data);
          }
          loadData();
        }}
      />
    )}
    </div>
  );
}




function validate() {
  const newErrors = {};
  // TODO: for each required field, check if form.fieldName is empty (an empty string is falsy),
  // and if so, add an entry to newErrors, e.g. newErrors.name = "필수 항목입니다";
  // there are 5 required fields to check — repeat the pattern for each
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
  if (Object.keys(newErrors).length != 0) {
    setSubmitting(false);
  }
  setSubmitting(true);
  try {
    const { service_type, name, ...appointmentData } = form;
    await createAppointment(appointmentData);
    onCreated();
  } finally {
    setSubmitting(false);
  }
}