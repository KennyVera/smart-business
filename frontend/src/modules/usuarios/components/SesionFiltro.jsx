import { Form } from "react-bootstrap";

function SesionFiltro({ soloActivas, onCambio }) {
  return (
    <div className="sesion-filtro">
      <Form.Check
        type="switch"
        id="filtro-sesiones-activas"
        label="Filtrar solo sesiones activas"
        checked={soloActivas}
        onChange={(event) => onCambio(event.target.checked)}
      />
    </div>
  );
}

export default SesionFiltro;
