const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
});

const percentageFormatter = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const hoursFormatter = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 1,
});

const sizeFormatter = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 1,
});

const dateTimeFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function parseLocalDate(isoDate: string): Date {
  return new Date(`${isoDate}T12:00:00`);
}

export function formatFecha(isoDate: string): string {
  return dateFormatter.format(parseLocalDate(isoDate));
}

export function formatFechaCorta(isoDate: string): string {
  return shortDateFormatter.format(parseLocalDate(isoDate));
}

export function formatPorcentaje(value: number | null): string {
  if (value === null) {
    return "—";
  }

  return `${percentageFormatter.format(value)} %`;
}

export function formatHoras(value: number): string {
  return hoursFormatter.format(value);
}

export function formatHorasPar(asistidas: number, dictadas: number): string {
  return `${formatHoras(asistidas)}/${formatHoras(dictadas)}`;
}

export function formatNumero(value: number): string {
  return new Intl.NumberFormat("es-AR").format(value);
}

export function formatAnio(anio: number): string {
  return `${anio}.º`;
}

export function formatFechaHora(isoDateTime: string): string {
  return dateTimeFormatter.format(new Date(isoDateTime));
}

export function formatComision(comisionId: string): string {
  return `Com. ${comisionId.replace("com-", "")}`;
}

export function formatTamanio(bytes: number): string {
  if (bytes < 1024) {
    return `${formatNumero(bytes)} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${sizeFormatter.format(bytes / 1024)} KB`;
  }

  return `${sizeFormatter.format(bytes / (1024 * 1024))} MB`;
}
