const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Retorna la fecha de hoy en formato YYYY-MM-DD en zona horaria local
 */
export function getHoyFechaStr(): string {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

/**
 * Calcula el nombre del día de la semana para una fecha YYYY-MM-DD
 * Ejemplo: "2026-08-03" -> "Lunes"
 */
export function getDiaSemana(fechaStr: string): string {
  if (!fechaStr) return '';
  const [anio, mes, dia] = fechaStr.split('-').map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  return DIAS_SEMANA[fecha.getDay()] || '';
}

/**
 * Formatea fecha YYYY-MM-DD a DD/MM/YYYY
 * Ejemplo: "2026-08-03" -> "03/08/2026"
 */
export function formatearFechaCorta(fechaStr: string): string {
  if (!fechaStr) return '';
  const [anio, mes, dia] = fechaStr.split('-');
  return `${dia}/${mes}/${anio}`;
}

/**
 * Formatea fecha completa con día de la semana
 * Ejemplo: "2026-08-30" -> "Domingo 30 de Agosto de 2026"
 */
export function formatearFechaCompleta(fechaStr: string): string {
  if (!fechaStr) return '';
  const [anio, mes, dia] = fechaStr.split('-').map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  const nombreDia = DIAS_SEMANA[fecha.getDay()];
  const nombreMes = MESES[mes - 1];
  return `${nombreDia} ${dia} de ${nombreMes} de ${anio}`;
}

/**
 * Retorna el nombre del mes dado su número (1-12)
 */
export function getNombreMes(numMes: number): string {
  return MESES[numMes - 1] || '';
}

export const LISTA_MESES = MESES.map((nombre, index) => ({
  numero: index + 1,
  nombre
}));
