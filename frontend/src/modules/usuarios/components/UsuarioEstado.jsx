function UsuarioEstado({ activo }) {
  return (
    <span className={`usuario-badge${activo ? " is-on" : " is-off"}`}>
      {activo ? "Activo" : "Inactivo"}
    </span>
  );
}

export default UsuarioEstado;
