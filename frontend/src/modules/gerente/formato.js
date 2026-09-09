export function dineroGerente(valor) {
  const n = Number(valor) || 0;
  return `$ ${n.toLocaleString("es-EC", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function aISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Hoy en calendario local (YYYY-MM-DD). */
export function hoyISO() {
  return aISO(new Date());
}

/** Fecha mínima de auditoría: 2 años atrás desde hoy. */
export function fechaMinAuditoria() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 2);
  return aISO(d);
}

export function fechaISO(diasAtras = 0) {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  return aISO(d);
}

/** Recorta la fecha al rango [min, max] permitido. */
export function acotarFecha(valor, min = fechaMinAuditoria(), max = hoyISO()) {
  if (!valor) return max;
  if (valor < min) return min;
  if (valor > max) return max;
  return valor;
}

export function validarRangoFechas(desde, hasta) {
  const min = fechaMinAuditoria();
  const max = hoyISO();
  const ini = acotarFecha(desde, min, max);
  const fin = acotarFecha(hasta, min, max);
  if (ini > fin) {
    return {
      ok: false,
      desde: ini,
      hasta: fin,
      error: "La fecha Desde no puede ser posterior a Hasta.",
    };
  }
  return { ok: true, desde: ini, hasta: fin, error: "" };
}

export function horaCorta(iso) {
  if (!iso) return "—";
  const parte = String(iso);
  const t = parte.includes("T") ? parte.slice(11, 16) : parte.slice(0, 5);
  return t || "—";
}

export function fechaHoraCorta(iso) {
  if (!iso) return "—";
  const s = String(iso);
  const fecha = s.slice(0, 10);
  const hora = s.includes("T") ? s.slice(11, 16) : "";
  return hora ? `${fecha} ${hora}` : fecha;
}
