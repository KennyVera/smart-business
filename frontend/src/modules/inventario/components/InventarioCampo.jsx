function InventarioCampo({ icon: Icon, label, ayuda, children }) {
  return (
    <div className="inv-field">
      <label className="inv-field-label">{label}</label>
      <div className="inv-field-control">
        {Icon ? <Icon size={16} strokeWidth={1.75} /> : null}
        {children}
      </div>
      {ayuda ? <small className="inv-field-ayuda">{ayuda}</small> : null}
    </div>
  );
}

export default InventarioCampo;
