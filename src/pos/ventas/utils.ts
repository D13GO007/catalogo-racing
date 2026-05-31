export const formatoPesos = (numero: number): string =>
  '$' + Math.round(numero).toLocaleString('es-CO');

export const limpiarMoneda = (str: string | number): number =>
  parseInt(str.toString().replace(/\D/g, ''), 10) || 0;

export const obtenerNumeroComprobanteDesdeVentaId = (ventaId?: string | null): string => {
  const segmentoFinal = (ventaId || '').split('-').pop()?.trim();
  if (segmentoFinal) return segmentoFinal.toUpperCase();
  return String(Date.now()).slice(-5);
};

/**
 * Convierte un entero secuencial en un código de comprobante legible:
 *   1–999   →  "001", "002", …, "999"
 *   1000+   →  "A01", …, "A99", "B01", …, "Z99",
 *              "AA01", …, "ZZ99", "AAA01", …  (crece automáticamente)
 */
export const formatNumeroFactura = (n: number): string => {
  if (n <= 999) return String(n).padStart(3, '0');

  let offset = n - 1000;
  let numLetras = 1;
  let bloqueSize = 26 * 99; // 26^1 * 99

  while (offset >= bloqueSize) {
    offset -= bloqueSize;
    numLetras++;
    bloqueSize = Math.pow(26, numLetras) * 99;
  }

  const numParte = (offset % 99) + 1;
  let letraOffset = Math.floor(offset / 99);
  let letras = '';
  for (let i = 0; i < numLetras; i++) {
    letras = String.fromCharCode(65 + (letraOffset % 26)) + letras;
    letraOffset = Math.floor(letraOffset / 26);
  }

  return `${letras}${String(numParte).padStart(2, '0')}`;
};
