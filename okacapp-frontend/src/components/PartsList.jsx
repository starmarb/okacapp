export default function PartsList({ parts }) {
  if (!parts || parts.length === 0) {
    return <p className="empty-state">추가된 부품이 없습니다.</p>;
  }

  return (
    <div className="parts-list">
      {parts.map((part) => (
        <div key={part.id} className="part-row">
          <div>
            <strong>{part.brand}</strong> {part.name} {part.quantity}ea
          </div>
          {part.model_number && <div className="part-model">{part.model_number}</div>}
        </div>
      ))}
    </div>
  );
}
