export const formatoPesos = (numero: number): string =>
  '$' + Math.round(numero).toLocaleString('es-CO');

export const limpiarMoneda = (str: string | number): number =>
  parseInt(str.toString().replace(/\D/g, ''), 10) || 0;

export const obtenerNumeroComprobanteDesdeVentaId = (ventaId?: string | null): string => {
  const segmentoFinal = (ventaId || '').split('-').pop()?.trim();
  if (segmentoFinal) return segmentoFinal.toUpperCase();
  return String(Date.now()).slice(-5);
};
