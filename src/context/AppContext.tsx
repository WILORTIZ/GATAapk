import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Cliente, 
  Turno, 
  Cobro, 
  CierreMensual, 
  ConfiguracionApp, 
  VistaActiva,
  EstadoTurno,
  MetodoPago
} from '../types';
import { CLIENTES_INICIALES, TURNOS_INICIALES, COBROS_INICIALES } from '../utils/mockData';
import { getHoyFechaStr, getDiaSemana } from '../utils/dateUtils';

interface AppContextType {
  clientes: Cliente[];
  turnos: Turno[];
  cobros: Cobro[];
  cierres: CierreMensual[];
  config: ConfiguracionApp;
  vistaActiva: VistaActiva;
  clienteSeleccionadoId: string | null;
  setVistaActiva: (vista: VistaActiva) => void;
  setClienteSeleccionadoId: (id: string | null) => void;
  
  // Acciones Clientes
  agregarCliente: (cliente: Omit<Cliente, 'id' | 'fechaCreacion'>) => Cliente;
  actualizarCliente: (cliente: Cliente) => void;
  eliminarCliente: (id: string) => void;
  
  // Acciones Turnos
  agregarTurno: (datos: {
    clienteId: string;
    fecha: string;
    observaciones?: string;
    valorPersonalizado?: number;
  }) => { turno?: Turno; esDuplicado?: boolean };
  actualizarTurno: (turno: Turno) => void;
  eliminarTurno: (id: string) => void;
  anularTurno: (id: string) => void;

  // Autenticación
  autenticado: boolean;
  iniciarSesion: (usuario: string, clave: string) => boolean;
  cerrarSesion: () => void;
  verificarTurnoDuplicado: (clienteId: string, fecha: string) => boolean;

  // Acciones Cobros
  cobrarTurnoIndividual: (turnoId: string, datosPago: {
    valor: number;
    metodo: MetodoPago;
    observacion?: string;
    fechaPago?: string;
  }) => Cobro;
  cobrarTurnosMultiples: (turnoIds: string[], datosPago: {
    clienteId: string;
    valor: number;
    metodo: MetodoPago;
    observacion?: string;
    fechaPago?: string;
  }) => Cobro;
  cobrarPorRango: (clienteId: string, desde: string, hasta: string, datosPago: {
    valor: number;
    metodo: MetodoPago;
    observacion?: string;
    fechaPago?: string;
  }) => Cobro;
  cobrarParcial: (clienteId: string, valorPago: number, modo: 'auto' | 'manual', turnoIdsManuales: string[], datosPago: {
    metodo: MetodoPago;
    observacion?: string;
    fechaPago?: string;
  }) => Cobro;
  anularCobro: (cobroId: string) => void;

  // Acciones Cierres
  guardarCierre: (cierre: CierreMensual) => void;
  eliminarCierre: (cierreId: string) => void;

  // Acciones Configuración / Respaldo
  actualizarConfig: (nuevaConfig: ConfiguracionApp) => void;
  restablecerDatos: () => void;
  importarDatos: (datos: {
    clientes: Cliente[];
    turnos: Turno[];
    cobros: Cobro[];
    cierres: CierreMensual[];
    config?: ConfiguracionApp;
  }) => boolean;

  // Métricas financieras calculadas
  metricas: {
    turnosHoy: number;
    turnosMes: number;
    generadoMes: number;
    porCobrarTotal: number;
    cobradoTotal: number;
    saldoAFavorTotal: number;
  };

  // Helper para estadísticas por cliente
  getClienteStats: (clienteId: string) => {
    cantidadTurnos: number;
    diasTrabajados: number;
    generado: number;
    cobrado: number;
    pendiente: number;
  };
}

const STORAGE_KEYS = {
  CLIENTES: 'gata_clientes_v3',
  TURNOS: 'gata_turnos_v3',
  COBROS: 'gata_cobros_v3',
  CIERRES: 'gata_cierres_v3',
  CONFIG: 'gata_config_v3'
};

const CONFIG_DEFAULT: ConfiguracionApp = {
  moneda: 'COP',
  simboloMoneda: '$',
  nombreNegocio: 'GATA Control de Turnos',
  propietario: 'Administrador'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vistaActiva, setVistaActiva] = useState<VistaActiva>('inicio');
  const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState<string | null>(null);

  const [autenticado, setAutenticado] = useState<boolean>(() => {
    return localStorage.getItem('gata_sesion_activa_v1') === 'true';
  });

  const iniciarSesion = (usuario: string, clave: string): boolean => {
    const userClean = usuario.trim().toLowerCase();
    const passClean = clave.trim();
    if (userClean === 'gata' && passClean === '924') {
      setAutenticado(true);
      localStorage.setItem('gata_sesion_activa_v1', 'true');
      return true;
    }
    return false;
  };

  const cerrarSesion = () => {
    setAutenticado(false);
    localStorage.removeItem('gata_sesion_activa_v1');
  };

  // Inicializar estado desde LocalStorage o MockData
  const [clientes, setClientes] = useState<Cliente[]>(() => {
    const guardado = localStorage.getItem(STORAGE_KEYS.CLIENTES);
    return guardado ? JSON.parse(guardado) : CLIENTES_INICIALES;
  });

  const [turnos, setTurnos] = useState<Turno[]>(() => {
    const guardado = localStorage.getItem(STORAGE_KEYS.TURNOS);
    return guardado ? JSON.parse(guardado) : TURNOS_INICIALES;
  });

  const [cobros, setCobros] = useState<Cobro[]>(() => {
    const guardado = localStorage.getItem(STORAGE_KEYS.COBROS);
    return guardado ? JSON.parse(guardado) : COBROS_INICIALES;
  });

  const [cierres, setCierres] = useState<CierreMensual[]>(() => {
    const guardado = localStorage.getItem(STORAGE_KEYS.CIERRES);
    return guardado ? JSON.parse(guardado) : [];
  });

  const [config, setConfig] = useState<ConfiguracionApp>(() => {
    const guardado = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return guardado ? JSON.parse(guardado) : CONFIG_DEFAULT;
  });

  // Guardar cambios en LocalStorage automáticamente
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(clientes));
  }, [clientes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TURNOS, JSON.stringify(turnos));
  }, [turnos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COBROS, JSON.stringify(cobros));
  }, [cobros]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CIERRES, JSON.stringify(cierres));
  }, [cierres]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }, [config]);

  // Gestión de Clientes
  const agregarCliente = (datos: Omit<Cliente, 'id' | 'fechaCreacion'>): Cliente => {
    const nuevoCliente: Cliente = {
      ...datos,
      id: `cli-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      fechaCreacion: new Date().toISOString()
    };
    setClientes(prev => [nuevoCliente, ...prev]);
    return nuevoCliente;
  };

  const actualizarCliente = (clienteActualizado: Cliente) => {
    setClientes(prev => prev.map(c => c.id === clienteActualizado.id ? clienteActualizado : c));
    // Nota: ¡Los turnos históricos NUNCA se recalculan con el nuevo precio del cliente!
    // Solo se actualiza el nombre en turnos si fue editado para consistencia visual
    setTurnos(prev => prev.map(t => t.clienteId === clienteActualizado.id ? { ...t, clienteNombre: clienteActualizado.nombre } : t));
  };

  const eliminarCliente = (id: string) => {
    // Marcamos inactivo o eliminamos
    setClientes(prev => prev.filter(c => c.id !== id));
  };

  // Gestión de Turnos
  const verificarTurnoDuplicado = (clienteId: string, fecha: string): boolean => {
    return turnos.some(t => t.clienteId === clienteId && t.fecha === fecha && t.estado !== 'Anulado');
  };

  const agregarTurno = (datos: {
    clienteId: string;
    fecha: string;
    observaciones?: string;
    valorPersonalizado?: number;
  }): { turno?: Turno; esDuplicado?: boolean } => {
    const cliente = clientes.find(c => c.id === datos.clienteId);
    if (!cliente) return {};

    const valorTurno = datos.valorPersonalizado !== undefined ? datos.valorPersonalizado : cliente.valorTurnoActual;
    const diaSemana = getDiaSemana(datos.fecha);
    const ahora = new Date().toISOString();

    const nuevoTurno: Turno = {
      id: `tur-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      clienteId: cliente.id,
      clienteNombre: cliente.nombre,
      fecha: datos.fecha,
      diaSemana,
      valor: valorTurno, // Valor histórico congelado
      estado: 'Por cobrar',
      observaciones: datos.observaciones?.trim() || '',
      fechaCreacion: ahora,
      fechaModificacion: ahora
    };

    setTurnos(prev => [nuevoTurno, ...prev]);
    return { turno: nuevoTurno };
  };

  const actualizarTurno = (turnoActualizado: Turno) => {
    const ahora = new Date().toISOString();
    setTurnos(prev => prev.map(t => t.id === turnoActualizado.id ? {
      ...turnoActualizado,
      diaSemana: getDiaSemana(turnoActualizado.fecha),
      fechaModificacion: ahora
    } : t));
  };

  const anularTurno = (id: string) => {
    const ahora = new Date().toISOString();
    setTurnos(prev => prev.map(t => t.id === id ? {
      ...t,
      estado: 'Anulado',
      fechaModificacion: ahora
    } : t));
  };

  const eliminarTurno = (id: string) => {
    setTurnos(prev => prev.filter(t => t.id !== id));
  };

  // Gestión de Cobros y Aislamiento de Clientes
  const cobrarTurnoIndividual = (turnoId: string, datosPago: {
    valor: number;
    metodo: MetodoPago;
    observacion?: string;
    fechaPago?: string;
  }): Cobro => {
    const turno = turnos.find(t => t.id === turnoId);
    if (!turno) throw new Error('Turno no encontrado');

    const nuevoCobro: Cobro = {
      id: `cob-${Date.now()}`,
      clienteId: turno.clienteId,
      clienteNombre: turno.clienteNombre,
      fechaPago: datosPago.fechaPago || getHoyFechaStr(),
      valor: datosPago.valor,
      metodo: datosPago.metodo,
      turnoIds: [turnoId],
      observacion: datosPago.observacion || '',
      fechaRegistro: new Date().toISOString(),
      estado: 'Valido'
    };

    setCobros(prev => [nuevoCobro, ...prev]);
    setTurnos(prev => prev.map(t => t.id === turnoId ? {
      ...t,
      estado: 'Cobrado',
      pagoId: nuevoCobro.id,
      fechaModificacion: new Date().toISOString()
    } : t));

    return nuevoCobro;
  };

  const cobrarTurnosMultiples = (turnoIds: string[], datosPago: {
    clienteId: string;
    valor: number;
    metodo: MetodoPago;
    observacion?: string;
    fechaPago?: string;
  }): Cobro => {
    const cliente = clientes.find(c => c.id === datosPago.clienteId);
    const nombreCliente = cliente ? cliente.nombre : 'Cliente';

    const nuevoCobro: Cobro = {
      id: `cob-${Date.now()}`,
      clienteId: datosPago.clienteId,
      clienteNombre: nombreCliente,
      fechaPago: datosPago.fechaPago || getHoyFechaStr(),
      valor: datosPago.valor,
      metodo: datosPago.metodo,
      turnoIds: turnoIds,
      observacion: datosPago.observacion || '',
      fechaRegistro: new Date().toISOString(),
      estado: 'Valido'
    };

    const turnoSet = new Set(turnoIds);
    setCobros(prev => [nuevoCobro, ...prev]);
    // Regla de aislamiento: solo los turnos del cliente seleccionados
    setTurnos(prev => prev.map(t => (t.clienteId === datosPago.clienteId && turnoSet.has(t.id)) ? {
      ...t,
      estado: 'Cobrado',
      pagoId: nuevoCobro.id,
      fechaModificacion: new Date().toISOString()
    } : t));

    return nuevoCobro;
  };

  const cobrarPorRango = (clienteId: string, desde: string, hasta: string, datosPago: {
    valor: number;
    metodo: MetodoPago;
    observacion?: string;
    fechaPago?: string;
  }): Cobro => {
    const cliente = clientes.find(c => c.id === clienteId);
    const nombreCliente = cliente ? cliente.nombre : 'Cliente';

    // Aislamiento estricto: turnos de este cliente, pendientes, en el rango
    const turnosEnRango = turnos.filter(t => 
      t.clienteId === clienteId &&
      (t.estado === 'Por cobrar' || t.estado === 'Realizado') &&
      t.fecha >= desde &&
      t.fecha <= hasta
    );

    const turnoIds = turnosEnRango.map(t => t.id);

    const nuevoCobro: Cobro = {
      id: `cob-${Date.now()}`,
      clienteId,
      clienteNombre: nombreCliente,
      fechaPago: datosPago.fechaPago || getHoyFechaStr(),
      valor: datosPago.valor,
      metodo: datosPago.metodo,
      turnoIds,
      rangoFechas: { desde, hasta },
      observacion: datosPago.observacion || `Cobro por rango de fechas ${desde} a ${hasta}`,
      fechaRegistro: new Date().toISOString(),
      estado: 'Valido'
    };

    const turnoSet = new Set(turnoIds);
    setCobros(prev => [nuevoCobro, ...prev]);
    setTurnos(prev => prev.map(t => (t.clienteId === clienteId && turnoSet.has(t.id)) ? {
      ...t,
      estado: 'Cobrado',
      pagoId: nuevoCobro.id,
      fechaModificacion: new Date().toISOString()
    } : t));

    return nuevoCobro;
  };

  const cobrarParcial = (
    clienteId: string, 
    valorPago: number, 
    modo: 'auto' | 'manual', 
    turnoIdsManuales: string[], 
    datosPago: {
      metodo: MetodoPago;
      observacion?: string;
      fechaPago?: string;
    }
  ): Cobro => {
    const cliente = clientes.find(c => c.id === clienteId);
    const nombreCliente = cliente ? cliente.nombre : 'Cliente';

    let turnosACobrarIds: string[] = [];

    if (modo === 'manual') {
      turnosACobrarIds = turnoIdsManuales;
    } else {
      // Auto: Aplicar a los turnos pendientes más antiguos cronológicamente
      const turnosPendientes = turnos
        .filter(t => t.clienteId === clienteId && (t.estado === 'Por cobrar' || t.estado === 'Realizado'))
        .sort((a, b) => a.fecha.localeCompare(b.fecha));

      let montoAcumulado = 0;
      for (const t of turnosPendientes) {
        if (montoAcumulado + t.valor <= valorPago || turnosACobrarIds.length === 0) {
          turnosACobrarIds.push(t.id);
          montoAcumulado += t.valor;
        }
      }
    }

    const nuevoCobro: Cobro = {
      id: `cob-${Date.now()}`,
      clienteId,
      clienteNombre: nombreCliente,
      fechaPago: datosPago.fechaPago || getHoyFechaStr(),
      valor: valorPago,
      metodo: datosPago.metodo,
      turnoIds: turnosACobrarIds,
      observacion: datosPago.observacion || `Abono parcial de ${valorPago}`,
      fechaRegistro: new Date().toISOString(),
      estado: 'Valido'
    };

    const turnoSet = new Set(turnosACobrarIds);
    setCobros(prev => [nuevoCobro, ...prev]);
    setTurnos(prev => prev.map(t => (t.clienteId === clienteId && turnoSet.has(t.id)) ? {
      ...t,
      estado: 'Cobrado',
      pagoId: nuevoCobro.id,
      fechaModificacion: new Date().toISOString()
    } : t));

    return nuevoCobro;
  };

  const anularCobro = (cobroId: string) => {
    const cobro = cobros.find(c => c.id === cobroId);
    if (!cobro) return;

    // Regresar los turnos asociados a 'Por cobrar'
    const turnoSet = new Set(cobro.turnoIds);
    setTurnos(prev => prev.map(t => (t.clienteId === cobro.clienteId && turnoSet.has(t.id)) ? {
      ...t,
      estado: 'Por cobrar',
      pagoId: undefined,
      fechaModificacion: new Date().toISOString()
    } : t));

    // Marcar cobro como anulado
    setCobros(prev => prev.map(c => c.id === cobroId ? { ...c, estado: 'Anulado' } : c));
  };

  // Cierres
  const guardarCierre = (cierre: CierreMensual) => {
    setCierres(prev => {
      const existeIndex = prev.findIndex(c => c.mes === cierre.mes && c.anio === cierre.anio);
      if (existeIndex >= 0) {
        const copia = [...prev];
        copia[existeIndex] = cierre;
        return copia;
      }
      return [cierre, ...prev];
    });
  };

  const eliminarCierre = (cierreId: string) => {
    setCierres(prev => prev.filter(c => c.id !== cierreId));
  };

  // Config y utilidades
  const actualizarConfig = (nuevaConfig: ConfiguracionApp) => {
    setConfig(nuevaConfig);
  };

  const restablecerDatos = () => {
    setClientes(CLIENTES_INICIALES);
    setTurnos(TURNOS_INICIALES);
    setCobros(COBROS_INICIALES);
    setCierres([]);
    setConfig(CONFIG_DEFAULT);
    localStorage.clear();
  };

  const importarDatos = (datos: {
    clientes: Cliente[];
    turnos: Turno[];
    cobros: Cobro[];
    cierres: CierreMensual[];
    config?: ConfiguracionApp;
  }): boolean => {
    try {
      if (Array.isArray(datos.clientes)) setClientes(datos.clientes);
      if (Array.isArray(datos.turnos)) setTurnos(datos.turnos);
      if (Array.isArray(datos.cobros)) setCobros(datos.cobros);
      if (Array.isArray(datos.cierres)) setCierres(datos.cierres);
      if (datos.config) setConfig(datos.config);
      return true;
    } catch {
      return false;
    }
  };

  // Estadísticas por cliente
  const getClienteStats = (clienteId: string) => {
    const turnosCliente = turnos.filter(t => t.clienteId === clienteId && t.estado !== 'Anulado');
    const fechasUnicas = new Set(turnosCliente.map(t => t.fecha));
    
    let generado = 0;
    let cobrado = 0;
    let pendiente = 0;

    turnosCliente.forEach(t => {
      generado += t.valor;
      if (t.estado === 'Cobrado') {
        cobrado += t.valor;
      } else if (t.estado === 'Por cobrar' || t.estado === 'Realizado') {
        pendiente += t.valor;
      }
    });

    return {
      cantidadTurnos: turnosCliente.length,
      diasTrabajados: fechasUnicas.size,
      generado,
      cobrado,
      pendiente
    };
  };

  // Métricas financieras globales
  const metricas = useMemo(() => {
    const hoyStr = getHoyFechaStr();
    const hoyFecha = new Date();
    const mesActualNum = hoyFecha.getMonth() + 1;
    const anioActualNum = hoyFecha.getFullYear();

    let turnosHoy = 0;
    let turnosMes = 0;
    let generadoMes = 0;
    let porCobrarTotal = 0;
    let cobradoTotal = 0;

    turnos.forEach(t => {
      if (t.estado === 'Anulado') return;

      // Turnos hoy
      if (t.fecha === hoyStr) {
        turnosHoy += 1;
      }

      // Turnos y generado del mes
      const [tAnio, tMes] = t.fecha.split('-').map(Number);
      if (tAnio === anioActualNum && tMes === mesActualNum) {
        turnosMes += 1;
        generadoMes += t.valor;
      }

      // Por cobrar total
      if (t.estado === 'Por cobrar' || t.estado === 'Realizado') {
        porCobrarTotal += t.valor;
      }
    });

    // Cobrado total (de cobros válidos)
    cobros.forEach(c => {
      if (c.estado !== 'Anulado') {
        cobradoTotal += c.valor;
      }
    });

    // Saldo a favor = total acumulado de dinero efectivamente cobrado
    const saldoAFavorTotal = cobradoTotal;

    return {
      turnosHoy,
      turnosMes,
      generadoMes,
      porCobrarTotal,
      cobradoTotal,
      saldoAFavorTotal
    };
  }, [turnos, cobros]);

  return (
    <AppContext.Provider value={{
      clientes,
      turnos,
      cobros,
      cierres,
      config,
      vistaActiva,
      clienteSeleccionadoId,
      setVistaActiva,
      setClienteSeleccionadoId,
      agregarCliente,
      actualizarCliente,
      eliminarCliente,
      agregarTurno,
      actualizarTurno,
      eliminarTurno,
      anularTurno,
      autenticado,
      iniciarSesion,
      cerrarSesion,
      verificarTurnoDuplicado,
      cobrarTurnoIndividual,
      cobrarTurnosMultiples,
      cobrarPorRango,
      cobrarParcial,
      anularCobro,
      guardarCierre,
      eliminarCierre,
      actualizarConfig,
      restablecerDatos,
      importarDatos,
      metricas,
      getClienteStats
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe usarse dentro de un AppProvider');
  }
  return context;
};
