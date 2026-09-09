import { CircleUserRound, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "../../../shared/useRecurso";
import { fetchClientePorCedula } from "../api/posApi";
import { CONSUMIDOR_FINAL_NOMBRE, CONSUMIDOR_FINAL_RUC } from "../impuestos";
import ModalNuevoCliente from "./ModalNuevoCliente";

const SOLO_DIGITOS = /\D/g;

function etiquetaConsumidor() {
  return `👤 Cliente: ${CONSUMIDOR_FINAL_NOMBRE} (${CONSUMIDOR_FINAL_RUC})`;
}

function etiquetaAfiliado(cliente) {
  const nombre = cliente.nombre_completo || `${cliente.nombres} ${cliente.apellidos}`;
  return `👤 Cliente: ${nombre.trim()} - Afiliado`;
}

function identificacionValida(cedula) {
  return cedula.length === 10 || cedula.length === 13;
}

/** Auto-reconocimiento CRM: cédula 10 o RUC 13 dispara la consulta. */
function ClienteBuscador({ cliente, onCliente }) {
  const [texto, setTexto] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [registrar, setRegistrar] = useState(false);
  const [avisoOk, setAvisoOk] = useState("");
  const consulta = useDebounce(texto, 400);
  const ultima = useRef("");

  useEffect(() => {
    if (!avisoOk) return undefined;
    const oculta = setTimeout(() => setAvisoOk(""), 3500);
    return () => clearTimeout(oculta);
  }, [avisoOk]);

  useEffect(() => {
    if (!cliente) return;
    ultima.current = String(cliente.cedula_ruc || cliente.cedula || "").replace(
      SOLO_DIGITOS,
      "",
    );
    setNoEncontrado(false);
  }, [cliente]);

  useEffect(() => {
    const cedula = consulta.trim();
    if (!identificacionValida(cedula)) {
      setNoEncontrado(false);
      if (!cedula) onCliente(null);
      return undefined;
    }
    if (cedula === ultima.current) return undefined;
    let viva = true;
    setBuscando(true);
    fetchClientePorCedula(cedula)
      .then((encontrado) => {
        if (!viva) return;
        ultima.current = cedula;
        setNoEncontrado(!encontrado);
        onCliente(encontrado);
      })
      .catch(() => {
        if (!viva) return;
        setNoEncontrado(false);
        onCliente(null);
      })
      .finally(() => {
        if (viva) setBuscando(false);
      });
    return () => {
      viva = false;
    };
  }, [consulta, onCliente]);

  async function buscarAhora() {
    const cedula = texto.trim();
    if (!cedula) {
      setNoEncontrado(false);
      onCliente(null);
      return;
    }
    if (!identificacionValida(cedula)) {
      setNoEncontrado(false);
      return;
    }
    setBuscando(true);
    try {
      const encontrado = await fetchClientePorCedula(cedula);
      ultima.current = cedula;
      setNoEncontrado(!encontrado);
      onCliente(encontrado);
    } catch {
      setNoEncontrado(false);
      onCliente(null);
    } finally {
      setBuscando(false);
    }
  }

  function onCreado(nuevo) {
    const cedula = String(nuevo.cedula_ruc || nuevo.cedula || texto).replace(
      SOLO_DIGITOS,
      "",
    );
    ultima.current = cedula;
    setTexto(cedula);
    setNoEncontrado(false);
    setRegistrar(false);
    setAvisoOk("Cliente registrado y seleccionado.");
    onCliente(nuevo);
  }

  return (
    <div className="pos-cliente">
      <span className="pos-etiqueta">
        <CircleUserRound size={15} strokeWidth={1.75} />
        ID Cliente (CRM)
      </span>
      <div className="pos-cliente-campo">
        <input
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={13}
          placeholder="Cédula (10) o RUC (13)"
          value={texto}
          onChange={(evento) => {
            setTexto(evento.target.value.replace(SOLO_DIGITOS, "").slice(0, 13));
            setAvisoOk("");
          }}
          onBlur={buscarAhora}
          onKeyDown={(evento) => {
            if (evento.key !== "Enter") return;
            evento.preventDefault();
            buscarAhora();
          }}
        />
        <button
          type="button"
          title="Buscar cliente"
          disabled={buscando}
          onClick={buscarAhora}
        >
          <Search size={15} strokeWidth={2} />
        </button>
      </div>
      {avisoOk ? <p className="pos-cliente-ok">{avisoOk}</p> : null}
      {cliente ? (
        <p className="pos-cliente-ficha is-afiliado">{etiquetaAfiliado(cliente)}</p>
      ) : noEncontrado && identificacionValida(texto.trim()) ? (
        <div className="pos-cliente-alta">
          <p className="pos-cliente-estado mb-0">Cliente no encontrado.</p>
          <button
            type="button"
            className="pos-btn-registrar"
            onClick={() => setRegistrar(true)}
          >
            + Registrar Cliente
          </button>
        </div>
      ) : (
        <p className="pos-cliente-ficha">{etiquetaConsumidor()}</p>
      )}
      <ModalNuevoCliente
        show={registrar}
        cedulaInicial={texto}
        onClose={() => setRegistrar(false)}
        onCreado={onCreado}
      />
    </div>
  );
}

export default ClienteBuscador;
