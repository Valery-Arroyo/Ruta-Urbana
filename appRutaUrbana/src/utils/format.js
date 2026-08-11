
export function formatCurrency(valor, idioma) {
  const numero = Number(valor) || 0;
  const locale = idioma === "en" ? "en-US" : "es-CR";

  return `₡${numero.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function formatDateTime(fecha, idioma) {
  if (!fecha) return "—";

  const locale = idioma === "en" ? "en-US" : "es-CR";
  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) return "—";

  return valor.toLocaleString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
