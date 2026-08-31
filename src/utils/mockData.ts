import { Cliente, Turno, Cobro } from '../types';

export const CLIENTES_INICIALES: Cliente[] = [
  {
    id: 'cli-1',
    nombre: 'Juan Pérez',
    identificacion: 'CC 10203040',
    telefono: '300 123 4567',
    direccion: 'Calle 100 # 15-20',
    valorTurnoActual: 100000,
    estado: 'Activo',
    fechaCreacion: '2026-08-01T08:00:00.000Z',
    observacionesGenerales: 'Turnos fijos lunes, miércoles y viernes.'
  },
  {
    id: 'cli-2',
    nombre: 'María López',
    identificacion: 'CC 50607080',
    telefono: '310 987 6543',
    direccion: 'Carrera 7 # 45-12',
    valorTurnoActual: 80000,
    estado: 'Activo',
    fechaCreacion: '2026-08-01T08:00:00.000Z',
    observacionesGenerales: 'Pago quincenal por transferencia.'
  },
  {
    id: 'cli-3',
    nombre: 'Carlos Rodríguez',
    identificacion: 'NIT 900123456-1',
    telefono: '320 456 7890',
    direccion: 'Av. El Dorado # 68-50',
    valorTurnoActual: 120000,
    estado: 'Activo',
    fechaCreacion: '2026-08-05T08:00:00.000Z',
    observacionesGenerales: 'Turnos nocturnos especiales.'
  }
];

// Exactamente 5 turnos por cobrar y 5 turnos cobrados para pruebas
export const TURNOS_INICIALES: Turno[] = [
  // --- 5 TURNOS POR COBRAR ---
  {
    id: 'tur-pen-1',
    clienteId: 'cli-1',
    clienteNombre: 'Juan Pérez',
    fecha: '2026-08-10',
    diaSemana: 'Lunes',
    valor: 100000,
    estado: 'Por cobrar',
    observaciones: 'Turno de inicio de semana.',
    fechaCreacion: '2026-08-10T18:00:00.000Z',
    fechaModificacion: '2026-08-10T18:00:00.000Z'
  },
  {
    id: 'tur-pen-2',
    clienteId: 'cli-1',
    clienteNombre: 'Juan Pérez',
    fecha: '2026-08-12',
    diaSemana: 'Miércoles',
    valor: 100000,
    estado: 'Por cobrar',
    observaciones: 'El cliente solicitó cambio de horario a las 2:00 PM.',
    fechaCreacion: '2026-08-12T18:00:00.000Z',
    fechaModificacion: '2026-08-12T18:00:00.000Z'
  },
  {
    id: 'tur-pen-3',
    clienteId: 'cli-1',
    clienteNombre: 'Juan Pérez',
    fecha: '2026-08-15',
    diaSemana: 'Sábado',
    valor: 100000,
    estado: 'Por cobrar',
    observaciones: 'Se realizó turno adicional a solicitud del cliente.',
    fechaCreacion: '2026-08-15T18:00:00.000Z',
    fechaModificacion: '2026-08-15T18:00:00.000Z'
  },
  {
    id: 'tur-pen-4',
    clienteId: 'cli-2',
    clienteNombre: 'María López',
    fecha: '2026-08-18',
    diaSemana: 'Martes',
    valor: 80000,
    estado: 'Por cobrar',
    observaciones: 'Se trabajó hasta las 10:00 p. m.',
    fechaCreacion: '2026-08-18T18:00:00.000Z',
    fechaModificacion: '2026-08-18T18:00:00.000Z'
  },
  {
    id: 'tur-pen-5',
    clienteId: 'cli-3',
    clienteNombre: 'Carlos Rodríguez',
    fecha: '2026-08-20',
    diaSemana: 'Jueves',
    valor: 120000,
    estado: 'Por cobrar',
    observaciones: 'Turno especial nocturno de apertura.',
    fechaCreacion: '2026-08-20T18:00:00.000Z',
    fechaModificacion: '2026-08-20T18:00:00.000Z'
  },

  // --- 5 TURNOS COBRADOS ---
  {
    id: 'tur-cob-1',
    clienteId: 'cli-1',
    clienteNombre: 'Juan Pérez',
    fecha: '2026-08-03',
    diaSemana: 'Lunes',
    valor: 100000,
    estado: 'Cobrado',
    observaciones: 'Turno cubierto sin novedades.',
    fechaCreacion: '2026-08-03T18:00:00.000Z',
    fechaModificacion: '2026-08-03T19:00:00.000Z',
    pagoId: 'cob-1'
  },
  {
    id: 'tur-cob-2',
    clienteId: 'cli-1',
    clienteNombre: 'Juan Pérez',
    fecha: '2026-08-05',
    diaSemana: 'Miércoles',
    valor: 100000,
    estado: 'Cobrado',
    observaciones: 'Turno normal realizado.',
    fechaCreacion: '2026-08-05T18:00:00.000Z',
    fechaModificacion: '2026-08-05T19:00:00.000Z',
    pagoId: 'cob-2'
  },
  {
    id: 'tur-cob-3',
    clienteId: 'cli-2',
    clienteNombre: 'María López',
    fecha: '2026-08-04',
    diaSemana: 'Martes',
    valor: 80000,
    estado: 'Cobrado',
    observaciones: 'Turno diurno regular.',
    fechaCreacion: '2026-08-04T18:00:00.000Z',
    fechaModificacion: '2026-08-04T20:00:00.000Z',
    pagoId: 'cob-3'
  },
  {
    id: 'tur-cob-4',
    clienteId: 'cli-2',
    clienteNombre: 'María López',
    fecha: '2026-08-06',
    diaSemana: 'Jueves',
    valor: 80000,
    estado: 'Cobrado',
    observaciones: 'Turno regular completado.',
    fechaCreacion: '2026-08-06T18:00:00.000Z',
    fechaModificacion: '2026-08-06T20:00:00.000Z',
    pagoId: 'cob-4'
  },
  {
    id: 'tur-cob-5',
    clienteId: 'cli-3',
    clienteNombre: 'Carlos Rodríguez',
    fecha: '2026-08-08',
    diaSemana: 'Sábado',
    valor: 120000,
    estado: 'Cobrado',
    observaciones: 'Turno fin de semana.',
    fechaCreacion: '2026-08-08T18:00:00.000Z',
    fechaModificacion: '2026-08-08T20:00:00.000Z',
    pagoId: 'cob-5'
  }
];

// Exactamente 5 cobros registrados
export const COBROS_INICIALES: Cobro[] = [
  {
    id: 'cob-1',
    clienteId: 'cli-1',
    clienteNombre: 'Juan Pérez',
    fechaPago: '2026-08-03',
    valor: 100000,
    metodo: 'Transferencia',
    turnoIds: ['tur-cob-1'],
    observacion: 'Pago de turno del 3 de agosto recibido por Bancolombia.',
    fechaRegistro: '2026-08-03T19:00:00.000Z',
    estado: 'Valido'
  },
  {
    id: 'cob-2',
    clienteId: 'cli-1',
    clienteNombre: 'Juan Pérez',
    fechaPago: '2026-08-05',
    valor: 100000,
    metodo: 'Nequi',
    turnoIds: ['tur-cob-2'],
    observacion: 'Pago recibido por Nequi.',
    fechaRegistro: '2026-08-05T19:00:00.000Z',
    estado: 'Valido'
  },
  {
    id: 'cob-3',
    clienteId: 'cli-2',
    clienteNombre: 'María López',
    fechaPago: '2026-08-04',
    valor: 80000,
    metodo: 'Efectivo',
    turnoIds: ['tur-cob-3'],
    observacion: 'Cobro en efectivo entregado al terminar el turno.',
    fechaRegistro: '2026-08-04T20:00:00.000Z',
    estado: 'Valido'
  },
  {
    id: 'cob-4',
    clienteId: 'cli-2',
    clienteNombre: 'María López',
    fechaPago: '2026-08-06',
    valor: 80000,
    metodo: 'Daviplata',
    turnoIds: ['tur-cob-4'],
    observacion: 'Comprobante Daviplata #98765.',
    fechaRegistro: '2026-08-06T20:00:00.000Z',
    estado: 'Valido'
  },
  {
    id: 'cob-5',
    clienteId: 'cli-3',
    clienteNombre: 'Carlos Rodríguez',
    fechaPago: '2026-08-08',
    valor: 120000,
    metodo: 'Transferencia',
    turnoIds: ['tur-cob-5'],
    observacion: 'Transferencia Bancolombia.',
    fechaRegistro: '2026-08-08T20:00:00.000Z',
    estado: 'Valido'
  }
];
