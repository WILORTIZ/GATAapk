import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Turno, Cliente, MetodoPago } from '../types';
import { getHoyFechaStr, formatearFechaCorta, formatearFechaCompleta } from '../utils/dateUtils';
import { formatearMoneda } from '../utils/formatters';
import { 
  CircleDollarSign, 
  X, 
  Check, 
  Calendar, 
  AlertCircle, 
  CreditCard, 
  FileText,
  User,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

export type ModoCobro = 'individual' | 'multiples' | 'rango' | 'parcial' | 'todo';

interface ModalCobroProps {
  isOpen: boolean;
  onClose: () => void;
  modoInicial?: ModoCobro;
  clienteIdInicial?: string;
  turnoIdInicial?: string;
  turnosIdsIniciales?: string[];
}

export const ModalCobro: React.FC<ModalCobroProps> = ({
  isOpen,
  onClose,
  modoInicial = 'individual',
  clienteIdInicial,
  turnoIdInicial,
  turnosIdsIniciales = []
}) => {
  const { 
    clientes, 
    turnos, 
    cobrarTurnoIndividual, 
    cobrarTurnosMultiples, 
    cobrarPorRango, 
    cobrarParcial 
  } = useApp();

  const [modo, setModo] = useState<ModoCobro>(modoInicial);
  const [clienteId, setClienteId] = useState<string>(clienteIdInicial || '');
  const [turnoIdIndividual, setTurnoIdIndividual] = useState<string>(turnoIdInicial || '');
  const [turnosSeleccionadosIds, setTurnosSeleccionadosIds] = useState<string[]>(turnosIdsIniciales);

  // Rango de fechas: inicializar con fecha amplia para capturar turnos actuales
  const [fechaDesde, setFechaDesde] = useState<string>('2026-08-01');
  const [fechaHasta, setFechaHasta] = useState<string>('2026-08-31');

  // Parciales
  const [montoParcial, setMontoParcial] = useState<string>('');
  const [distribucionModo, setDistribucionModo] = useState<'auto' | 'manual'>('auto');

  // Datos del pago
  const [fechaPago, setFechaPago] = useState<string>(getHoyFechaStr());
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('Transferencia');
  const [observacionPago, setObservacionPago] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Sincronizar estado al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setModo(modoInicial);
      setFechaPago(getHoyFechaStr());
      setObservacionPago('');
      setErrorMsg('');

      let cid = clienteIdInicial || '';
      if (!cid && clientes.length > 0) {
        // Seleccionar el primer cliente que tenga turnos pendientes
        const cliConDeuda = clientes.find(c => 
          turnos.some(t => t.clienteId === c.id && (t.estado === 'Por cobrar' || t.estado === 'Realizado'))
        );
        cid = cliConDeuda ? cliConDeuda.id : clientes[0].id;
      }

      if (turnoIdInicial) {
        const t = turnos.find(item => item.id === turnoIdInicial);
        if (t) {
          cid = t.clienteId;
          setTurnoIdIndividual(t.id);
        }
      }

      setClienteId(cid);

      // Turnos pendientes de este cliente
      const pendientes = turnos.filter(t => 
        t.clienteId === cid && (t.estado === 'Por cobrar' || t.estado === 'Realizado')
      ).sort((a, b) => a.fecha.localeCompare(b.fecha));

      if (pendientes.length > 0) {
        if (!turnoIdInicial || !pendientes.some(t => t.id === turnoIdInicial)) {
          setTurnoIdIndividual(pendientes[0].id);
        }
        // Ajustar fechas rango
        setFechaDesde(pendientes[0].fecha);
        setFechaHasta(pendientes[pendientes.length - 1].fecha);
      } else {
        setFechaDesde('2026-08-01');
        setFechaHasta('2026-08-31');
      }

      if (turnosIdsIniciales.length > 0) {
        setTurnosSeleccionadosIds(turnosIdsIniciales);
      } else if (pendientes.length > 0) {
        setTurnosSeleccionadosIds([pendientes[0].id]);
      } else {
        setTurnosSeleccionadosIds([]);
      }
    }
  }, [isOpen, modoInicial, clienteIdInicial, turnoIdInicial, turnosIdsIniciales, clientes, turnos]);

  // Cuando cambia el cliente en el select, actualizar turnos por defecto
  const handleCambioCliente = (nuevoClienteId: string) => {
    setClienteId(nuevoClienteId);
    setErrorMsg('');

    const pendientes = turnos.filter(t => 
      t.clienteId === nuevoClienteId && (t.estado === 'Por cobrar' || t.estado === 'Realizado')
    ).sort((a, b) => a.fecha.localeCompare(b.fecha));

    if (pendientes.length > 0) {
      setTurnoIdIndividual(pendientes[0].id);
      setTurnosSeleccionadosIds([pendientes[0].id]);
      setFechaDesde(pendientes[0].fecha);
      setFechaHasta(pendientes[pendientes.length - 1].fecha);
    } else {
      setTurnoIdIndividual('');
      setTurnosSeleccionadosIds([]);
    }
  };

  if (!isOpen) return null;

  const clienteSeleccionado = clientes.find(c => c.id === clienteId);

  // Turnos pendientes de este cliente específico (Aislamiento de clientes)
  const turnosPendientesCliente = turnos.filter(t => 
    t.clienteId === clienteId && 
    (t.estado === 'Por cobrar' || t.estado === 'Realizado')
  ).sort((a, b) => a.fecha.localeCompare(b.fecha));

  const totalPendienteCliente = turnosPendientesCliente.reduce((sum, t) => sum + t.valor, 0);

  // Turno individual seleccionado
  const turnoIndividual = turnosPendientesCliente.find(t => t.id === turnoIdIndividual) || turnosPendientesCliente[0];

  // Turnos en el rango de fechas
  const turnosEnRango = turnosPendientesCliente.filter(t => 
    t.fecha >= fechaDesde && t.fecha <= fechaHasta
  );
  const totalRango = turnosEnRango.reduce((sum, t) => sum + t.valor, 0);

  // Turnos múltiples seleccionados
  const turnosMultiples = turnosPendientesCliente.filter(t => 
    turnosSeleccionadosIds.includes(t.id)
  );
  const totalMultiples = turnosMultiples.reduce((sum, t) => sum + t.valor, 0);

  // Cálculo parcial
  const valorParcialNum = parseFloat(montoParcial) || 0;
  const turnosAfectadosAuto = useMemo(() => {
    let acum = 0;
    const lista: Turno[] = [];
    for (const t of turnosPendientesCliente) {
      if (acum + t.valor <= valorParcialNum || lista.length === 0) {
        lista.push(t);
        acum += t.valor;
      }
    }
    return lista;
  }, [turnosPendientesCliente, valorParcialNum]);

  // Monto total a cobrar según modo
  let totalACobrar = 0;
  if (modo === 'individual') {
    totalACobrar = turnoIndividual ? turnoIndividual.valor : 0;
  } else if (modo === 'multiples') {
    totalACobrar = totalMultiples;
  } else if (modo === 'rango') {
    totalACobrar = totalRango;
  } else if (modo === 'todo') {
    totalACobrar = totalPendienteCliente;
  } else if (modo === 'parcial') {
    totalACobrar = valorParcialNum;
  }

  const handleToggleSeleccionTurno = (id: string) => {
    setTurnosSeleccionadosIds(prev => 
      prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
    );
  };

  const handleConfirmarCobro = () => {
    setErrorMsg('');

    if (!clienteId) {
      setErrorMsg('Selecciona un cliente.');
      return;
    }

    if (totalACobrar <= 0) {
      setErrorMsg('El valor a cobrar debe ser mayor a 0.');
      return;
    }

    const payload = {
      valor: totalACobrar,
      metodo: metodoPago,
      observacion: observacionPago.trim() || undefined,
      fechaPago
    };

    try {
      if (modo === 'individual') {
        const idFinal = turnoIndividual?.id || turnoIdIndividual;
        if (!idFinal) {
          setErrorMsg('Selecciona un turno para cobrar.');
          return;
        }
        cobrarTurnoIndividual(idFinal, payload);
      } else if (modo === 'multiples') {
        if (turnosSeleccionadosIds.length === 0) {
          setErrorMsg('Selecciona al menos un turno para cobrar.');
          return;
        }
        cobrarTurnosMultiples(turnosSeleccionadosIds, {
          clienteId,
          ...payload
        });
      } else if (modo === 'rango') {
        if (turnosEnRango.length === 0) {
          setErrorMsg('No hay turnos pendientes en el rango de fechas seleccionado.');
          return;
        }
        cobrarPorRango(clienteId, fechaDesde, fechaHasta, payload);
      } else if (modo === 'todo') {
        if (turnosPendientesCliente.length === 0) {
          setErrorMsg('No hay turnos pendientes para este cliente.');
          return;
        }
        const todosIds = turnosPendientesCliente.map(t => t.id);
        cobrarTurnosMultiples(todosIds, {
          clienteId,
          ...payload,
          observacion: observacionPago || 'Cobro total de saldo pendiente'
        });
      } else if (modo === 'parcial') {
        if (valorParcialNum > totalPendienteCliente) {
          setErrorMsg('El valor del pago parcial no puede superar el total pendiente del cliente.');
          return;
        }
        cobrarParcial(
          clienteId, 
          valorParcialNum, 
          distribucionModo, 
          turnosSeleccionadosIds, 
          payload
        );
      }

      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch {}

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar el cobro.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-xs">
              <CircleDollarSign className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Registrar Cobro</h2>
              <p className="text-xs text-emerald-100 font-medium">Gestión de pago y recibo de dinero</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          
          {/* Tabs de Modo de Cobro */}
          <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 overflow-x-auto text-xs font-bold">
            {[
              { id: 'individual', label: '1. Individual' },
              { id: 'multiples', label: '2. Varios' },
              { id: 'rango', label: '3. Por Rango' },
              { id: 'parcial', label: '4. Parcial' },
              { id: 'todo', label: '5. Todo' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setModo(tab.id as ModoCobro);
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 px-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  modo === tab.id 
                    ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Selector de Cliente */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-600" />
                Cliente a Cobrar
              </span>
              <span className="text-emerald-700 font-extrabold text-xs">
                Saldo pendiente: {formatearMoneda(totalPendienteCliente)}
              </span>
            </label>
            <select
              value={clienteId}
              onChange={(e) => handleCambioCliente(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            >
              {clientes.map(c => {
                const pendMonto = turnos.filter(t => t.clienteId === c.id && (t.estado === 'Por cobrar' || t.estado === 'Realizado')).reduce((s, t) => s + t.valor, 0);
                return (
                  <option key={c.id} value={c.id}>
                    {c.nombre} — Pendiente: {formatearMoneda(pendMonto)}
                  </option>
                );
              })}
            </select>
          </div>

          {/* ======================================================== */}
          {/* MODO 1: INDIVIDUAL (Sección 13 del PDF)                  */}
          {/* ======================================================== */}
          {modo === 'individual' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Selecciona el turno a cobrar:
                </label>
                <span className="text-xs text-slate-500">
                  {turnosPendientesCliente.length} turno(s) pendiente(s)
                </span>
              </div>

              {turnosPendientesCliente.length === 0 ? (
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500 space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                  <p className="font-bold text-slate-700">Este cliente no tiene turnos pendientes por cobrar.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {turnosPendientesCliente.map(t => {
                    const isSelected = (turnoIndividual?.id === t.id);
                    return (
                      <div
                        key={t.id}
                        onClick={() => setTurnoIdIndividual(t.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected 
                            ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs' 
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900">{formatearFechaCorta(t.fecha)}</span>
                            <span className="text-xs font-bold text-brand-700">({t.diaSemana})</span>
                          </div>
                          {t.observaciones ? (
                            <div className="text-xs text-slate-600 italic mt-0.5 max-w-[260px] truncate">
                              "{t.observaciones}"
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-400 italic">Sin observaciones</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-black text-sm text-emerald-700">{formatearMoneda(t.valor)}</div>
                          <span className="text-[9px] font-bold uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                            {t.estado}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* MODO 2: VARIOS SELECCIONADOS (Sección 14 del PDF)       */}
          {/* ======================================================== */}
          {modo === 'multiples' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Selecciona los turnos ({turnosSeleccionadosIds.length} seleccionados):
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (turnosSeleccionadosIds.length === turnosPendientesCliente.length) {
                      setTurnosSeleccionadosIds([]);
                    } else {
                      setTurnosSeleccionadosIds(turnosPendientesCliente.map(t => t.id));
                    }
                  }}
                  className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  {turnosSeleccionadosIds.length === turnosPendientesCliente.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                </button>
              </div>

              {turnosPendientesCliente.length === 0 ? (
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500">
                  No hay turnos pendientes para este cliente.
                </div>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {turnosPendientesCliente.map(t => {
                    const isChecked = turnosSeleccionadosIds.includes(t.id);
                    return (
                      <div
                        key={t.id}
                        onClick={() => handleToggleSeleccionTurno(t.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isChecked 
                            ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500/30' 
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500 pointer-events-none"
                          />
                          <div>
                            <div className="font-bold text-xs sm:text-sm text-slate-800">
                              {formatearFechaCorta(t.fecha)} — <span className="text-emerald-700">{t.diaSemana}</span>
                            </div>
                            {t.observaciones && (
                              <div className="text-[11px] text-slate-500 italic truncate max-w-[200px]">
                                {t.observaciones}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="font-black text-sm text-emerald-700">
                          {formatearMoneda(t.valor)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* MODO 3: POR RANGO DE FECHAS (Sección 15 del PDF)         */}
          {/* ======================================================== */}
          {modo === 'rango' && (
            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Selecciona Rango de Fechas (Aislamiento: Solo {clienteSeleccionado?.nombre}):
              </span>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Desde:</label>
                  <input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Hasta:</label>
                  <input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* LISTA VISUAL DE TURNOS EN EL RANGO SELECCIONADO */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">
                    Turnos encontrados en el rango ({turnosEnRango.length}):
                  </span>
                  <span className="font-black text-emerald-700 text-sm">
                    Subtotal: {formatearMoneda(totalRango)}
                  </span>
                </div>

                {turnosEnRango.length === 0 ? (
                  <div className="p-3 bg-white border border-dashed border-slate-300 rounded-xl text-center text-xs text-slate-500">
                    No hay turnos pendientes entre el {formatearFechaCorta(fechaDesde)} y el {formatearFechaCorta(fechaHasta)}.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {turnosEnRango.map(t => (
                      <div key={t.id} className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between shadow-2xs">
                        <div>
                          <span className="font-bold text-slate-800">{formatearFechaCorta(t.fecha)}</span>
                          <span className="text-slate-500 ml-1.5 font-semibold">({t.diaSemana})</span>
                          {t.observaciones && <span className="text-slate-400 italic ml-2 truncate max-w-[150px] inline-block align-bottom">"{t.observaciones}"</span>}
                        </div>
                        <span className="font-black text-emerald-700">{formatearMoneda(t.valor)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODO 4: PAGO PARCIAL (Sección 17 y 18 del PDF)           */}
          {/* ======================================================== */}
          {modo === 'parcial' && (
            <div className="space-y-3 p-4 bg-amber-50/60 rounded-2xl border border-amber-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Monto del Abono / Pago Parcial
                </span>
                <span className="text-xs font-bold text-slate-600">
                  Pendiente: {formatearMoneda(totalPendienteCliente)}
                </span>
              </div>
              <input
                type="number"
                value={montoParcial}
                onChange={(e) => setMontoParcial(e.target.value)}
                placeholder="Ej: 100000"
                className="w-full bg-white border border-amber-300 rounded-xl px-3.5 py-2.5 text-base font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
              />

              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-700 block">Distribución del Pago:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDistribucionModo('auto')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      distribucionModo === 'auto' 
                        ? 'bg-amber-600 text-white border-amber-600' 
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    ⚡ Automática (Más antiguos)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDistribucionModo('manual')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      distribucionModo === 'manual' 
                        ? 'bg-amber-600 text-white border-amber-600' 
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    ✍️ Manual (Elegir turnos)
                  </button>
                </div>
              </div>

              {/* Vista previa de afectación */}
              <div className="bg-white p-3 rounded-xl border border-amber-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Turnos que se marcarán cobrados:</span>
                  <span className="font-bold text-slate-800">
                    {distribucionModo === 'auto' ? turnosAfectadosAuto.length : turnosSeleccionadosIds.length} turnos
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Saldo restante del cliente:</span>
                  <span className="font-bold text-rose-600">
                    {formatearMoneda(Math.max(0, totalPendienteCliente - valorParcialNum))}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODO 5: COBRAR TODO                                      */}
          {/* ======================================================== */}
          {modo === 'todo' && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 text-center space-y-2">
              <h4 className="font-bold text-sm text-emerald-900">Cobro Total de Pendientes</h4>
              <p className="text-xs text-emerald-700">
                Se cobrarán los <strong>{turnosPendientesCliente.length}</strong> turnos pendientes de <strong>{clienteSeleccionado?.nombre}</strong>.
              </p>
              <div className="text-2xl font-black text-emerald-800 pt-1">
                {formatearMoneda(totalPendienteCliente)}
              </div>
            </div>
          )}

          {/* DETALLES DEL PAGO (Método, Fecha, Observaciones) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Detalles de la Transacción
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Método de Pago *</label>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Transferencia">Transferencia Bancaria</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Nequi">Nequi</option>
                  <option value="Daviplata">Daviplata</option>
                  <option value="Bancolombia">Bancolombia</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Fecha del Pago *</label>
                <input
                  type="date"
                  value={fechaPago}
                  onChange={(e) => setFechaPago(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Observación del Cobro / Recibo</label>
              <input
                type="text"
                value={observacionPago}
                onChange={(e) => setObservacionPago(e.target.value)}
                placeholder="Ej: Transferencia Bancolombia comprobante #12345"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Resumen Total Destacado */}
          <div className="p-4 bg-emerald-600 text-white rounded-2xl flex items-center justify-between shadow-lg shadow-emerald-600/20">
            <div>
              <span className="text-xs font-semibold text-emerald-100 uppercase tracking-wider block">Total a Recibir</span>
              <span className="text-2xl font-black">{formatearMoneda(totalACobrar)}</span>
            </div>
            <div className="text-right text-xs text-emerald-100">
              <div>Estado resultante:</div>
              <span className="font-bold text-white uppercase bg-white/20 px-2 py-0.5 rounded-full inline-block mt-0.5">
                🟢 Cobrado
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmarCobro}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            CONFIRMAR COBRO
          </button>
        </div>
      </div>
    </div>
  );
};
