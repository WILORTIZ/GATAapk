export type EstadoCliente = 'Activo' | 'Inactivo';

export interface Cliente {
  id: string;
  nombre: string;
  identificacion?: string;
  telefono: string;
  direccion: string;
  valorTurnoActual: number;
  estado: EstadoCliente;
  fechaCreacion: string;
  observacionesGenerales?: string;
}

export type EstadoTurno = 'Realizado' | 'Por cobrar' | 'Cobrado' | 'Anulado';

export interface Turno {
  id: string;
  clienteId: string;
  clienteNombre: string;
  fecha: string; // YYYY-MM-DD
  diaSemana: string; // Lunes, Martes, etc.
  valor: number; // Valor histórico inmutable al momento de registrar
  estado: EstadoTurno;
  observaciones?: string;
  fechaCreacion: string;
  fechaModificacion: string;
  pagoId?: string;
}

export type MetodoPago = 
  | 'Efectivo' 
  | 'Transferencia' 
  | 'Nequi' 
  | 'Daviplata' 
  | 'Bancolombia' 
  | 'Tarjeta' 
  | 'Otro';

export interface Cobro {
  id: string;
  clienteId: string;
  clienteNombre: string;
  fechaPago: string; // YYYY-MM-DD
  valor: number;
  metodo: MetodoPago;
  turnoIds: string[];
  rangoFechas?: {
    desde: string;
    hasta: string;
  };
  observacion?: string;
  fechaRegistro: string;
  estado: 'Valido' | 'Anulado';
}

export interface CierreDetalleCliente {
  clienteId: string;
  clienteNombre: string;
  cantidadTurnos: number;
  diasTrabajados: number;
  generado: number;
  cobrado: number;
  pendiente: number;
  turnos: Array<{
    id: string;
    fecha: string;
    diaSemana: string;
    valor: number;
    estado: EstadoTurno;
    observacion?: string;
  }>;
}

export interface CierreMensual {
  id: string;
  mes: number; // 1-12
  anio: number;
  fechaCierre: string;
  clientes: CierreDetalleCliente[];
  totalTurnos: number;
  totalDiasTrabajados: number;
  totalGenerado: number;
  totalCobrado: number;
  totalPendiente: number;
  notas?: string;
}

export interface ConfiguracionApp {
  moneda: string;
  simboloMoneda: string;
  nombreNegocio: string;
  propietario: string;
}

export type VistaActiva = 
  | 'inicio'
  | 'clientes'
  | 'calendario'
  | 'turnos'
  | 'por_cobrar'
  | 'saldo_a_favor'
  | 'cierres'
  | 'reportes'
  | 'configuracion';
