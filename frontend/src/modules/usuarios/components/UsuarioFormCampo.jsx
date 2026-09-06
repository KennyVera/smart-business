function UsuarioFormCampo({ icon: Icon, label, ayuda, children }) {
  return (
    <div className="usuario-field">
      <label className="usuario-field-label">{label}</label>
      <div className="usuario-field-control">
        <Icon size={16} strokeWidth={1.75} />
        {children}
      </div>
      {ayuda ? <small className="usuario-field-ayuda">{ayuda}</small> : null}
    </div>
  );
}

export default UsuarioFormCampo;
