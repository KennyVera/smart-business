function InventarioHeader({ icon: Icon, titulo, detalle, children }) {
  return (
    <div className="inv-header">
      <div>
        <h2 className="inv-title">
          <Icon size={18} strokeWidth={1.75} />
          {titulo}
        </h2>
        {detalle ? <p className="inv-subtitle">{detalle}</p> : null}
      </div>
      {children ? <div className="inv-header-acciones">{children}</div> : null}
    </div>
  );
}

export default InventarioHeader;
