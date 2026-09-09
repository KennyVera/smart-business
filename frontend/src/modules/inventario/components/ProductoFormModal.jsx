import { PackagePlus, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { createProducto, fetchProductos, updateProducto } from "../api/inventarioApi";
import { mensajeApi } from "../../usuarios/rol";
import { leerPagina, TODOS } from "../../../shared/paginado";
import { generarSkuUnico } from "../sku";
import { filtrarCampo, validarProducto } from "../validacion";
import ProductoFormCampos from "./ProductoFormCampos";

const VACIO = {
  sku: "",
  nombre: "",
  categoria: "",
  proveedor: "",
  costo_actual: "",
  precio_venta: "",
  imagen: null,
  aplica_iva: true,
};

function ProductoFormModal({ show, producto, categorias, proveedores = [], onClose, onSaved }) {
  const [form, setForm] = useState(VACIO);
  const [error, setError] = useState("");
  const [generandoSku, setGenerandoSku] = useState(false);
  const editando = Boolean(producto);

  useEffect(() => {
    if (!show) return;
    setError("");
    setGenerandoSku(false);
    setForm(
      producto
        ? {
            sku: producto.sku,
            nombre: producto.nombre,
            categoria: String(producto.categoria),
            proveedor: producto.proveedor ? String(producto.proveedor) : "",
            costo_actual: String(producto.costo_actual),
            precio_venta: String(producto.precio_venta),
            imagen: null,
            aplica_iva: producto.aplica_iva !== false,
          }
        : VACIO,
    );
  }, [show, producto]);

  function onCampo(campo, valor) {
    setForm((actual) => ({ ...actual, [campo]: filtrarCampo(campo, valor) }));
  }

  async function onGenerarSku() {
    setGenerandoSku(true);
    setError("");
    try {
      const { data } = await fetchProductos({ page_size: TODOS });
      const usados = new Set(
        leerPagina(data).items.map((item) => String(item.sku || "").toUpperCase()),
      );
      if (editando && producto?.sku) {
        usados.delete(String(producto.sku).toUpperCase());
      }
      onCampo("sku", generarSkuUnico(usados));
    } catch {
      onCampo("sku", generarSkuUnico());
    } finally {
      setGenerandoSku(false);
    }
  }

  async function onSubmit(event) {
    event.preventDefault();
    const aviso = validarProducto(form);
    if (aviso) {
      setError(aviso);
      return;
    }
    const payload = {
      sku: form.sku.trim(),
      nombre: form.nombre.trim(),
      categoria: Number(form.categoria),
      proveedor: Number(form.proveedor),
      costo_actual: Number(form.costo_actual).toFixed(2),
      precio_venta: Number(form.precio_venta).toFixed(2),
      aplica_iva: Boolean(form.aplica_iva),
    };
    if (form.imagen instanceof File) {
      payload.imagen = form.imagen;
    }
    try {
      if (editando) {
        await updateProducto(producto.id_producto, payload);
      } else {
        await createProducto(payload);
      }
      onSaved();
    } catch (err) {
      setError(mensajeApi(err, "No se pudo guardar el producto."));
    }
  }

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      backdropClassName="inv-glass-backdrop"
      dialogClassName="inv-form-dialog"
    >
      <form onSubmit={onSubmit} noValidate>
        <Modal.Header closeButton>
          <Modal.Title className="inv-form-title">
            {editando ? <Pencil size={18} /> : <PackagePlus size={18} />}
            {editando ? "Editar producto" : "Nuevo producto"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error ? <p className="text-danger">{error}</p> : null}
          <ProductoFormCampos
            form={form}
            categorias={categorias}
            proveedores={proveedores}
            onCampo={onCampo}
            onGenerarSku={onGenerarSku}
            generandoSku={generandoSku}
          />
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-light" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn-inv">
            Guardar
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default ProductoFormModal;
