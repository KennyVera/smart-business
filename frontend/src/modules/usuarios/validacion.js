export const LIMITES = {
  username: 30,
  nombre: 40,
  apellido: 40,
  clave: 64,
};

const USERNAME_RE = /^[A-Za-z][A-Za-z0-9._-]{3,29}$/;
const NOMBRE_RE = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+(?:[ '\-][A-Za-zÁÉÍÓÚáéíóúÑñÜü]+)*$/;
const CLAVE_RE = /^(?=.*[A-Za-zÁÉÍÓÚáéíóúÑñÜü])(?=.*\d).{8,64}$/;

export function filtrarCampo(campo, valor) {
  if (campo === "username") {
    return valor
      .replace(/[^a-zA-Z0-9._-]/g, "")
      .replace(/^[^a-zA-Z]+/, "")
      .slice(0, LIMITES.username);
  }
  if (campo === "nombre" || campo === "apellido") {
    return valor.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñÜü '\-]/g, "").slice(0, LIMITES[campo]);
  }
  if (campo === "clave") {
    return valor.slice(0, LIMITES.clave);
  }
  return valor;
}

export function validarFormulario(form, { editando, esAdmin }) {
  if (!USERNAME_RE.test(form.username.trim())) {
    return "Usuario: 4 a 30 caracteres, empieza con letra. Solo letras, números, punto, _ o -.";
  }
  if (!NOMBRE_RE.test(form.nombre.trim()) || form.nombre.trim().length < 2) {
    return "Nombre: 2 a 40 letras. Sin números ni símbolos.";
  }
  if (!NOMBRE_RE.test(form.apellido.trim()) || form.apellido.trim().length < 2) {
    return "Apellido: 2 a 40 letras. Sin números ni símbolos.";
  }
  if (!form.rol) {
    return "Selecciona un rol.";
  }
  if (!esAdmin && !form.sucursal) {
    return "Asigna una sucursal al empleado.";
  }
  if (!editando && !CLAVE_RE.test(form.clave)) {
    return "Contraseña: mínimo 8 caracteres, con al menos una letra y un número.";
  }
  return "";
}
