import { Cliente, Turno, Cobro } from '../types';

export const CLIENTES_INICIALES: Cliente[] = [
  {
    id: 'cli-diego',
    nombre: 'DIEGO OSORIO',
    identificacion: 'CC 10203040',
    telefono: '300 123 4567',
    direccion: 'Oficina Central',
    valorTurnoActual: 120000,
    estado: 'Activo',
    fechaCreacion: '2026-08-01T08:00:00.000Z',
    observacionesGenerales: 'Cliente corporativo y finca.',
    color: 'verde'
  },
  {
    id: 'cli-harley',
    nombre: 'SEÑOR HARLEY',
    identificacion: 'CC 70809010',
    telefono: '310 987 6543',
    direccion: 'Sede Principal',
    valorTurnoActual: 90000,
    estado: 'Activo',
    fechaCreacion: '2026-08-01T08:00:00.000Z',
    observacionesGenerales: 'Turnos programados regulares.',
    color: 'azul'
  },
  {
    id: 'cli-denia',
    nombre: 'DENIA ERAZO',
    identificacion: 'CC 50607080',
    telefono: '320 456 7890',
    direccion: 'Sede Norte',
    valorTurnoActual: 70000,
    estado: 'Activo',
    fechaCreacion: '2026-08-01T08:00:00.000Z',
    observacionesGenerales: 'Cliente registrado.',
    color: 'negro'
  },
  {
    id: 'cli-harmoni',
    nombre: 'HARMONI',
    identificacion: 'NIT 900456789-1',
    telefono: '315 789 0123',
    direccion: 'Centro Comercial',
    valorTurnoActual: 80000,
    estado: 'Activo',
    fechaCreacion: '2026-08-01T08:00:00.000Z',
    observacionesGenerales: 'Cliente registrado.',
    color: 'rojo'
  }
];

export const TURNOS_INICIALES: Turno[] = [
  // --- TURNOS DE DIEGO OSORIO ($120.000 - VERDE) ---
  {
    id: 'tur-diego-1',
    clienteId: 'cli-diego',
    clienteNombre: 'DIEGO OSORIO',
    fecha: '2026-08-04',
    diaSemana: 'Martes',
    valor: 120000,
    estado: 'Por cobrar',
    observaciones: 'Oficina',
    fechaCreacion: '2026-08-04T18:00:00.000Z',
    fechaModificacion: '2026-08-04T18:00:00.000Z'
  },
  {
    id: 'tur-diego-2',
    clienteId: 'cli-diego',
    clienteNombre: 'DIEGO OSORIO',
    fecha: '2026-08-11',
    diaSemana: 'Martes',
    valor: 120000,
    estado: 'Por cobrar',
    observaciones: 'Finca',
    fechaCreacion: '2026-08-11T18:00:00.000Z',
    fechaModificacion: '2026-08-11T18:00:00.000Z'
  },
  {
    id: 'tur-diego-3',
    clienteId: 'cli-diego',
    clienteNombre: 'DIEGO OSORIO',
    fecha: '2026-08-18',
    diaSemana: 'Martes',
    valor: 120000,
    estado: 'Por cobrar',
    observaciones: 'Oficina',
    fechaCreacion: '2026-08-18T18:00:00.000Z',
    fechaModificacion: '2026-08-18T18:00:00.000Z'
  },
  {
    id: 'tur-diego-4',
    clienteId: 'cli-diego',
    clienteNombre: 'DIEGO OSORIO',
    fecha: '2026-08-20',
    diaSemana: 'Jueves',
    valor: 120000,
    estado: 'Por cobrar',
    observaciones: 'Oficina',
    fechaCreacion: '2026-08-20T18:00:00.000Z',
    fechaModificacion: '2026-08-20T18:00:00.000Z'
  },
  {
    id: 'tur-diego-5',
    clienteId: 'cli-diego',
    clienteNombre: 'DIEGO OSORIO',
    fecha: '2026-08-25',
    diaSemana: 'Martes',
    valor: 120000,
    estado: 'Por cobrar',
    observaciones: 'Oficina',
    fechaCreacion: '2026-08-25T18:00:00.000Z',
    fechaModificacion: '2026-08-25T18:00:00.000Z'
  },
  {
    id: 'tur-diego-6',
    clienteId: 'cli-diego',
    clienteNombre: 'DIEGO OSORIO',
    fecha: '2026-08-26',
    diaSemana: 'Miércoles',
    valor: 120000,
    estado: 'Por cobrar',
    observaciones: 'Finca',
    fechaCreacion: '2026-08-26T18:00:00.000Z',
    fechaModificacion: '2026-08-26T18:00:00.000Z'
  },
  {
    id: 'tur-diego-7',
    clienteId: 'cli-diego',
    clienteNombre: 'DIEGO OSORIO',
    fecha: '2026-08-31',
    diaSemana: 'Lunes',
    valor: 120000,
    estado: 'Por cobrar',
    observaciones: 'Oficina',
    fechaCreacion: '2026-08-31T18:00:00.000Z',
    fechaModificacion: '2026-08-31T18:00:00.000Z'
  },

  // --- TURNOS DE SEÑOR HARLEY ($90.000 - AZUL) ---
  {
    id: 'tur-harley-1',
    clienteId: 'cli-harley',
    clienteNombre: 'SEÑOR HARLEY',
    fecha: '2026-08-05',
    diaSemana: 'Miércoles',
    valor: 90000,
    estado: 'Por cobrar',
    observaciones: '',
    fechaCreacion: '2026-08-05T18:00:00.000Z',
    fechaModificacion: '2026-08-05T18:00:00.000Z'
  },
  {
    id: 'tur-harley-2',
    clienteId: 'cli-harley',
    clienteNombre: 'SEÑOR HARLEY',
    fecha: '2026-08-06',
    diaSemana: 'Jueves',
    valor: 90000,
    estado: 'Por cobrar',
    observaciones: '',
    fechaCreacion: '2026-08-06T18:00:00.000Z',
    fechaModificacion: '2026-08-06T18:00:00.000Z'
  },
  {
    id: 'tur-harley-3',
    clienteId: 'cli-harley',
    clienteNombre: 'SEÑOR HARLEY',
    fecha: '2026-08-12',
    diaSemana: 'Miércoles',
    valor: 90000,
    estado: 'Por cobrar',
    observaciones: '',
    fechaCreacion: '2026-08-12T18:00:00.000Z',
    fechaModificacion: '2026-08-12T18:00:00.000Z'
  },
  {
    id: 'tur-harley-4',
    clienteId: 'cli-harley',
    clienteNombre: 'SEÑOR HARLEY',
    fecha: '2026-08-13',
    diaSemana: 'Jueves',
    valor: 90000,
    estado: 'Por cobrar',
    observaciones: '',
    fechaCreacion: '2026-08-13T18:00:00.000Z',
    fechaModificacion: '2026-08-13T18:00:00.000Z'
  },
  {
    id: 'tur-harley-5',
    clienteId: 'cli-harley',
    clienteNombre: 'SEÑOR HARLEY',
    fecha: '2026-08-16',
    diaSemana: 'Domingo',
    valor: 90000,
    estado: 'Por cobrar',
    observaciones: '',
    fechaCreacion: '2026-08-16T18:00:00.000Z',
    fechaModificacion: '2026-08-16T18:00:00.000Z'
  },
  {
    id: 'tur-harley-6',
    clienteId: 'cli-harley',
    clienteNombre: 'SEÑOR HARLEY',
    fecha: '2026-08-27',
    diaSemana: 'Jueves',
    valor: 90000,
    estado: 'Por cobrar',
    observaciones: '',
    fechaCreacion: '2026-08-27T18:00:00.000Z',
    fechaModificacion: '2026-08-27T18:00:00.000Z'
  },
  {
    id: 'tur-harley-7',
    clienteId: 'cli-harley',
    clienteNombre: 'SEÑOR HARLEY',
    fecha: '2026-08-29',
    diaSemana: 'Sábado',
    valor: 90000,
    estado: 'Por cobrar',
    observaciones: '',
    fechaCreacion: '2026-08-29T18:00:00.000Z',
    fechaModificacion: '2026-08-29T18:00:00.000Z'
  }
];

export const COBROS_INICIALES: Cobro[] = [];
