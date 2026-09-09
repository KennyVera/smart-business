const LETRAS_NOMBRE = /[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]/g;
const CORREO_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const NOMBRE_MAX = 100;
const CORREO_MAX = 100;
const TELEFONO_MAX = 10;
const CEDULA_MAX = 13;
const CORREO_PERMITIDO = /[^A-Za-z0-9._%+\-@]/g;
const COEF_CEDULA = [2, 1, 2, 1, 2, 1, 2, 1, 2];
const COEF_RUC_PRIVADO = [4, 3, 2, 7, 6, 5, 4, 3, 2];
const COEF_RUC_PUBLICO = [3, 2, 7, 6, 5, 4, 3, 2];

export function soloDigitos(valor) {
  return String(valor || "").replace(/\D/g, "");
}

export function filtrarCedula(valor) {
  return soloDigitos(valor).slice(0, CEDULA_MAX);
}

export function filtrarTelefono(valor) {
  return soloDigitos(valor).slice(0, TELEFONO_MAX);
}

function provinciaOk(codigo) {
  return (codigo >= 1 && codigo <= 24) || codigo === 30;
}

function cedulaNatural(digitos) {
  if (digitos.length !== 10) return false;
  if (!provinciaOk(Number(digitos.slice(0, 2)))) return false;
  if (Number(digitos[2]) > 5) return false;
  let total = 0;
  COEF_CEDULA.forEach((coeficiente, indice) => {
    let valor = Number(digitos[indice]) * coeficiente;
    if (valor >= 10) valor -= 9;
    total += valor;
  });
  const verificador = (10 - (total % 10)) % 10;
  return verificador === Number(digitos[9]);
}

function modulo11(digitos, coeficientes) {
  const total = coeficientes.reduce(
    (suma, coeficiente, indice) => suma + Number(digitos[indice]) * coeficiente,
    0,
  );
  const residuo = total % 11;
  if (residuo === 0) return 0;
  const verificador = 11 - residuo;
  return verificador === 10 ? null : verificador;
}

export function identificacionValida(valor) {
  const digitos = soloDigitos(valor);
  if (digitos.length === 10) return cedulaNatural(digitos);
  if (digitos.length !== 13) return false;
  if (!provinciaOk(Number(digitos.slice(0, 2)))) return false;
  const tercer = Number(digitos[2]);
  if (tercer <= 5) {
    return cedulaNatural(digitos.slice(0, 10)) && /^\d{3}$/.test(digitos.slice(10));
  }
  if (tercer === 6) {
    return modulo11(digitos.slice(0, 8), COEF_RUC_PUBLICO) === Number(digitos[8]);
  }
  if (tercer === 9) {
    return modulo11(digitos.slice(0, 9), COEF_RUC_PRIVADO) === Number(digitos[9]);
  }
  return false;
}

export function filtrarNombre(valor) {
  return valor
    .replace(LETRAS_NOMBRE, "")
    .replace(/^\s+/, "")
    .replace(/\s+/g, " ")
    .slice(0, NOMBRE_MAX);
}

export function filtrarCorreo(valor) {
  return valor.replace(/\s/g, "").replace(CORREO_PERMITIDO, "").slice(0, CORREO_MAX);
}

function nombrePersonaOk(valor) {
  const texto = valor.trim();
  if (texto.length < 2 || texto.length > NOMBRE_MAX) return false;
  if (/\d/.test(texto)) return false;
  return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[ '\-][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/.test(texto);
}

export function validarCliente({ cedula, nombres, apellidos, correo, telefono }) {
  const errores = {
    cedula: "",
    nombres: "",
    apellidos: "",
    correo: "",
    telefono: "",
  };
  const identificacion = soloDigitos(cedula);
  if (identificacion.length !== 10 && identificacion.length !== 13) {
    errores.cedula = "La cédula debe tener 10 dígitos o el RUC 13.";
  } else if (!identificacionValida(identificacion)) {
    errores.cedula =
      identificacion.length === 13 ? "El RUC no es válido." : "La cédula no es válida.";
  }
  if (!nombres.trim()) {
    errores.nombres = "Indica los nombres del cliente.";
  } else if (!nombrePersonaOk(nombres)) {
    errores.nombres = "Los nombres solo admiten letras, espacios y guiones (máx. 100).";
  }
  if (!apellidos.trim()) {
    errores.apellidos = "Indica los apellidos del cliente.";
  } else if (!nombrePersonaOk(apellidos)) {
    errores.apellidos =
      "Los apellidos solo admiten letras, espacios y guiones (máx. 100).";
  }
  const mail = (correo || "").trim();
  if (mail && mail.length > CORREO_MAX) {
    errores.correo = `El correo admite hasta ${CORREO_MAX} caracteres.`;
  } else if (mail && !CORREO_RE.test(mail)) {
    errores.correo = "Escribe un correo válido para la factura electrónica.";
  }
  const tel = soloDigitos(telefono);
  if (tel && tel.length !== TELEFONO_MAX) {
    errores.telefono = "El teléfono móvil debe tener exactamente 10 dígitos.";
  }
  return errores;
}

export function hayErrores(errores) {
  return Object.values(errores).some(Boolean);
}

export { NOMBRE_MAX, CORREO_MAX, TELEFONO_MAX, CEDULA_MAX };
