function SucursalEstado({ activa }) {
  return (
    <span className={`sucursal-badge${activa ? " is-on" : " is-off"}`}>
      {activa ? "Activa" : "Inactiva"}
    </span>
  );
}

export default SucursalEstado;
