import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAppointments } from "../api/client";
import AddAppointmentModal from "../components/AddAppointmentModal";
import AppointmentCard from "../components/AppointmentCard";

export default function SchedulePage() {
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

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

  const todayAppointments = appointments
    .filter((appt) => appt.appointment_date.startsWith(today))
    .sort((a, b) => a.appointment_date.localeCompare(b.appointment_date));

  return (
    <div className="page">
      <div className="page-header">
        <h1>오늘의 스케줄</h1>
        <button className="icon-button" onClick={() => setShowModal(true)}>+</button>
      </div>

      <div className="card-list">
        {todayAppointments.map((appt) => (
          <AppointmentCard
            key={appt.id}
            appointment={appt}
            onClick={() => navigate(`/appointments/${appt.id}`)}
          />
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