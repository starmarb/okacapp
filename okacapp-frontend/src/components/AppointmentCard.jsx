const STATUS_LABELS = {
  scheduled: "예정",
  in_progress: "진행중",
  completed: "완료",
  cancelled: "취소",
};

export default function AppointmentCard({ appointment, onClick }) {
  return (
    <div className={`appointment-card status-${appointment.status}`} onClick={onClick}>
      <div className="appointment-card-header">
        <strong>{appointment.appointment_date || "시간 미정"}</strong>
        <span className="status-badge">{STATUS_LABELS[appointment.status]}</span>
      </div>
      <p>{appointment.address}</p>
      <p>{appointment.phone}</p>
    </div>
  );
}
