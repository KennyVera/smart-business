import { Pencil, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { createUsuario, updateUsuario } from "../api/usuariosApi";
import { esRolAdmin, mensajeApi } from "../rol";
import { filtrarCampo, validarFormulario } from "../validacion";
import UsuarioFormCampos from "./UsuarioFormCampos";

const VACIO = { username: "", nombre: "", apellido: "", rol: "", sucursal: "", clave: "" };

function UsuarioFormModal({ show, usuario, roles, sucursales, onClose, onSaved }) {
  const [form, setForm] = useState(VACIO);
  const [error, setError] = useState("");
  const editando = Boolean(usuario);
  const esAdmin = esRolAdmin(form.rol, roles);

  useEffect(() => {
    if (!show) return;
    setError("");
    setForm(
      usuario
        ? {
            username: usuario.username,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            rol: String(usuario.rol),
            sucursal: usuario.sucursal ? String(usuario.sucursal) : "",
            clave: "",
          }
        : VACIO,
    );
  }, [show, usuario]);

  function onCampo(campo, valor) {
    setForm((actual) => ({ ...actual, [campo]: filtrarCampo(campo, valor) }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    const aviso = validarFormulario(form, { editando, esAdmin });
    if (aviso) {
      setError(aviso);
      return;
    }
    const payload = {
      username: form.username.trim(),
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      rol: Number(form.rol),
      sucursal: esAdmin || !form.sucursal ? null : Number(form.sucursal),
      ...(editando ? {} : { clave: form.clave }),
    };
    try {
      if (editando) {
        await updateUsuario(usuario.id_usuario, payload);
      } else {
        await createUsuario(payload);
      }
      onSaved();
    } catch (err) {
      setError(mensajeApi(err, "No se pudo guardar el usuario."));
    }
  }

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      backdropClassName="usuario-glass-backdrop"
      dialogClassName="usuario-form-dialog"
    >
      <form onSubmit={onSubmit} noValidate>
        <Modal.Header closeButton>
          <Modal.Title className="usuario-form-title">
            {editando ? <Pencil size={18} /> : <UserPlus size={18} />}
            {editando ? "Editar usuario" : "Crear nuevo usuario"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error ? <p className="text-danger">{error}</p> : null}
          <UsuarioFormCampos
            form={form}
            roles={roles}
            sucursales={sucursales}
            editando={editando}
            esAdmin={esAdmin}
            onCampo={onCampo}
          />
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-light" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-nuevo-usuario">Guardar</button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default UsuarioFormModal;
