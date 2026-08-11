import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAppointment, updateAppointment } from "../api/client";
import PartsList from "../components/PartsList";
import AddPartModal from "../components/AddPartModal";

export default function AppointmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [workDone, setWorkDone] = useState("");
  const [showAddPartModal, setShowAddPartModal] = useState(false);

  async function loadAppointment() {
    const data = await getAppointment(id);
    setAppointment(data);
    setWorkDone(data.work_done || "");
  }

  useEffect(() => {
    loadAppointment();
  }, [id]);

  async function handleComplete() {
    await updateAppointment(id, {
      status: "completed",
      work_done: workDone,
      completed_date: new Date().toISOString().split("T")[0],
    });
    navigate("/");
  }

  if (!appointment) return <p>불러오는 중...</p>;

  return (
    <div className="page">
      <div className="appointment-header">
        <div>
          <strong>{appointment.appointment_date || "10:00AM"}</strong>
          <p>{appointment.address}</p>
          <p>{appointment.phone}</p>
        </div>
        <span className="status-badge">{appointment.status}</span>
      </div>

      <h2>진행한 작업</h2>
      <textarea
        placeholder="텍스트로 입력..."
        value={workDone}
        onChange={(e) => setWorkDone(e.target.value)}
      />

      <h2>사용된 부품</h2>
      <PartsList parts={appointment.parts} />

      <button className="secondary-button" onClick={() => setShowAddPartModal(true)}>
        + 부품 추가
      </button>

      {/* Photo upload deferred until AWS storage is configured */}

      <button className="primary-button" onClick={handleComplete}>
        완료
      </button>

      {showAddPartModal && (
        <AddPartModal
          appointmentId={id}
          onClose={() => setShowAddPartModal(false)}
          onAdded={() => {
            setShowAddPartModal(false);
            loadAppointment();
          }}
        />
      )}
    </div>
  );
}
