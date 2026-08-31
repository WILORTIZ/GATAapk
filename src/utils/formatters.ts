/**
 * Formatea valores numéricos a moneda colombiana o general (Ej: 100000 -> "$100.000")
 */
export function formatearMoneda(valor: number | undefined | null): string {
  if (valor === undefined || valor === null || isNaN(valor)) {
    return '$0';
  }
  const formateado = Math.round(valor).toLocaleString('es-CO');
  return `$${formateado}`;
}

/**
 * Parsea un string con formato numérico o de moneda a number
 */
export function parsearMoneda(texto: string): number {
  if (!texto) return 0;
  const soloNumeros = texto.replace(/[^0-9]/g, '');
  const num = parseInt(soloNumeros, 10);
  return isNaN(num) ? 0 : num;
}
