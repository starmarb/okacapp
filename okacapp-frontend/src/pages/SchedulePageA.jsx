import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAppointments } from "../api/client";
import AppointmentCard from "../components/AppointmentCard";
import AddAppointmentModal from "../components/AddAppointmentModal";

export default function SchedulePage() {
  const [appointments, setAppointments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function loadAppointments() {
    setLoading(true);
    const data = await getAppointments();
    setAppointments(data);
    setLoading(false);
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>오늘의 스케줄</h1>
        <button className="icon-button" onClick={() => setShowAddModal(true)}>
          +
        </button>
      </div>

      {loading && <p>불러오는 중...</p>}

      <div className="card-list">
        {appointments.map((appt) => (
          <AppointmentCard
            key={appt.id}
            appointment={appt}
            onClick={() => navigate(`/appointments/${appt.id}`)}
          />
        ))}
      </div>

      {showAddModal && (
        <AddAppointmentModal
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setShowAddModal(false);
            loadAppointments();
          }}
        />
      )}
    </div>
  );
}
