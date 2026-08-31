import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatearMoneda } from '../utils/formatters';
import { formatearFechaCorta } from '../utils/dateUtils';
import { 
  CircleDollarSign, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  AlertCircle, 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  ArrowUpRight,
  Clock,
  Layers,
  FileText,
  Filter,
  Eye
} from 'lucide-react';
import { ModalCobro } from '../components/ModalCobro';
import { Turno } from '../types';

export const PorCobrarView: React.FC = () => {
  const { clientes, turnos, metricas, setClienteSeleccionadoId, setVistaActiva } = useApp();

  const [tabPorCobrar, setTabPorCobrar] = useState<'clientes' | 'lista_turnos'>('clientes');
  const [modalCobroOpen, setModalCobroOpen] = useState(false);
  const [modalCobroModo, setModalCobroModo] = useState<'individual' | 'multiples' | 'rango' | 'parcial' | 'todo'>('todo');
  const [clienteIdCobro, setClienteIdCobro] = useState<string | undefined>(undefined);
  const [turnoIdCobro, setTurnoIdCobro] = useState<string | undefined>(undefined);

  // Cliente expandido para ver sus turnos directamente
  const [clienteExpandidoId, setClienteExpandidoId] = useState<string | null>(null);

  // Filtro de cliente en pestaña lista
  const [filtroClienteId, setFiltroClienteId] = useState<string>('todos');

  // Todos los turnos pendientes
  const todosLosTurnosPendientes = turnos.filter(t => 
    (t.estado === 'Por cobrar' || t.estado === 'Realizado')
  ).sort((a, b) => a.fecha.localeCompare(b.fecha));

  // Turnos pendientes filtrados por cliente
  const turnosPendientesFiltrados = todosLosTurnosPendientes.filter(t => 
    filtroClienteId === 'todos' || t.clienteId === filtroClienteId
  );

  // Listado de clientes con deudas pendientes
  const clientesConDeuda = clientes.map(c => {
    const turnosPendientes = turnos.filter(t => 
      t.clienteId === c.id && 
      (t.estado === 'Por cobrar' || t.estado === 'Realizado')
    ).sort((a, b) => a.fecha.localeCompare(b.fecha));

    const totalDeuda = turnosPendientes.reduce((sum, t) => sum + t.valor, 0);

    return {
      cliente: c,
      turnosPendientes,
      totalDeuda
    };
  }).filter(item => item.totalDeuda > 0).sort((a, b) => b.totalDeuda - a.totalDeuda);

  const abrirModalCobroParaCliente = (
    clienteId: string, 
    modo: 'individual' | 'multiples' | 'rango' | 'parcial' | 'todo',
    turnoId?: string
  ) => {
    setClienteIdCobro(clienteId);
    setTurnoIdCobro(turnoId);
    setModalCobroModo(modo);
    setModalCobroOpen(true);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Header y Total por Cobrar (Sección 20) */}
      <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 rounded-3xl p-6 text-white shadow-xl shadow-rose-600/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold text-rose-100 uppercase tracking-wider flex items-center gap-1.5">
            <CircleDollarSign className="w-4 h-4" />
            Cuentas Por Cobrar
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            🔴 POR COBRAR
          </h2>
          <p className="text-xs text-rose-100 font-medium">
            Consulta y cobro individual, múltiple o por rango de fechas
          </p>
        </div>

        {/* TOTAL GLOBAL */}
        <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20 sm:text-right">
          <span className="text-[10px] font-bold text-rose-100 uppercase tracking-wider block">
            TOTAL PENDIENTE GLOBAL
          </span>
          <span className="text-2xl sm:text-3xl font-black text-white">
            {formatearMoneda(metricas.porCobrarTotal)}
          </span>
        </div>
      </div>

      {/* Pestañas de Visualización */}
      <div className="flex bg-slate-200/80 p-1 rounded-2xl gap-1 text-xs font-bold">
        <button
          onClick={() => setTabPorCobrar('clientes')}
          className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            tabPorCobrar === 'clientes'
              ? 'bg-white text-rose-800 shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Por Cliente ({clientesConDeuda.length})</span>
        </button>

        <button
          onClick={() => setTabPorCobrar('lista_turnos')}
          className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            tabPorCobrar === 'lista_turnos'
              ? 'bg-white text-rose-800 shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Ver Todos los Turnos Pendientes ({todosLosTurnosPendientes.length})</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* VISTA 1: POR CLIENTE (Con tarjetas y turnos expandibles) */}
      {/* ======================================================== */}
      {tabPorCobrar === 'clientes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base">
              Clientes con Saldo Pendiente ({clientesConDeuda.length})
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Toca para ver turnos o cobrar
            </span>
          </div>

          {clientesConDeuda.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">¡Excelente! Todo está cobrado</h4>
              <p className="text-xs text-slate-400">No hay turnos pendientes de cobro en este momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clientesConDeuda.map(item => {
                const isExpanded = clienteExpandidoId === item.cliente.id;

                return (
                  <div
                    key={item.cliente.id}
                    className="bg-white rounded-3xl p-5 border border-rose-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    {/* Header item */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-700 font-black text-base shadow-xs">
                          {item.cliente.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-black text-base text-slate-900">
                            {item.cliente.nombre}
                          </h4>
                          <span className="text-xs text-slate-500 font-medium">
                            {item.turnosPendientes.length} turno(s) sin cobrar
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Saldo Pendiente</span>
                        <span className="text-lg font-black text-rose-600">
                          {formatearMoneda(item.totalDeuda)}
                        </span>
                      </div>
                    </div>

                    {/* Botón para ver los turnos pendientes de este cliente */}
                    <button
                      type="button"
                      onClick={() => setClienteExpandidoId(isExpanded ? null : item.cliente.id)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-brand-600" />
                        {isExpanded ? 'Ocultar turnos' : `Ver ${item.turnosPendientes.length} turno(s) pendientes`}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                    </button>

                    {/* LISTA EXPANDIBLE DE TURNOS DEL CLIENTE */}
                    {isExpanded && (
                      <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 animate-in fade-in">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Turnos pendientes de {item.cliente.nombre}:
                        </span>

                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {item.turnosPendientes.map(t => (
                            <div
                              key={t.id}
                              className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between shadow-2xs"
                            >
                              <div className="space-y-0.5">
                                <div className="font-bold text-slate-800">
                                  {formatearFechaCorta(t.fecha)} — <span className="text-brand-700">{t.diaSemana}</span>
                                </div>
                                {t.observaciones ? (
                                  <div className="text-[11px] text-slate-500 italic max-w-[200px] truncate">
                                    "{t.observaciones}"
                                  </div>
                                ) : (
                                  <div className="text-[11px] text-slate-400 italic">Sin observaciones</div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-slate-900">{formatearMoneda(t.valor)}</span>
                                <button
                                  onClick={() => abrirModalCobroParaCliente(item.cliente.id, 'individual', t.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2 py-1 rounded-lg cursor-pointer"
                                >
                                  Cobrar
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Botones de acción según sección 20 del PDF */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Opciones de Cobro para este cliente:
                      </span>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => abrirModalCobroParaCliente(item.cliente.id, 'individual')}
                          className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 text-xs font-bold border border-slate-200 transition-colors cursor-pointer text-left flex items-center gap-1.5"
                        >
                          <span>💰</span>
                          <span>Cobro Individual</span>
                        </button>

                        <button
                          onClick={() => abrirModalCobroParaCliente(item.cliente.id, 'multiples')}
                          className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 text-xs font-bold border border-slate-200 transition-colors cursor-pointer text-left flex items-center gap-1.5"
                        >
                          <span>💰</span>
                          <span>Cobrar Varios</span>
                        </button>

                        <button
                          onClick={() => abrirModalCobroParaCliente(item.cliente.id, 'rango')}
                          className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 text-xs font-bold border border-slate-200 transition-colors cursor-pointer text-left flex items-center gap-1.5"
                        >
                          <span>📅</span>
                          <span>Cobrar por Rango</span>
                        </button>

                        <button
                          onClick={() => abrirModalCobroParaCliente(item.cliente.id, 'todo')}
                          className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer text-left flex items-center gap-1.5"
                        >
                          <span>✨</span>
                          <span>Cobrar Todo</span>
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setClienteSeleccionadoId(item.cliente.id);
                          setVistaActiva('clientes');
                        }}
                        className="w-full text-center text-xs font-bold text-brand-600 hover:text-brand-700 pt-1 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        Ver ficha completa y días trabajados <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* VISTA 2: LISTA DE TODOS LOS TURNOS PENDIENTES           */}
      {/* ======================================================== */}
      {tabPorCobrar === 'lista_turnos' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Listado Detallado de Turnos Por Cobrar
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Mostrando {turnosPendientesFiltrados.length} turno(s) pendientes de cobro
              </p>
            </div>

            {/* Filtro por Cliente */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Cliente:</span>
              <select
                value={filtroClienteId}
                onChange={(e) => setFiltroClienteId(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
              >
                <option value="todos">Todos los Clientes</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {turnosPendientesFiltrados.length === 0 ? (
            <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
              No hay turnos pendientes para el filtro seleccionado.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {turnosPendientesFiltrados.map(t => (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-emerald-300 transition-all flex flex-col justify-between space-y-2.5 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-black text-sm text-slate-900">{t.clienteNombre}</h4>
                      <div className="text-xs text-slate-500 font-medium">
                        {formatearFechaCorta(t.fecha)} — <strong className="text-brand-700">{t.diaSemana}</strong>
                      </div>
                    </div>
                    <span className="font-black text-base text-rose-600">
                      {formatearMoneda(t.valor)}
                    </span>
                  </div>

                  {/* Observaciones */}
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Observación:
                    </span>
                    {t.observaciones ? (
                      <span className="text-slate-700 italic">"{t.observaciones}"</span>
                    ) : (
                      <span className="text-slate-400 italic">Sin observaciones</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <button
                      onClick={() => abrirModalCobroParaCliente(t.clienteId, 'rango')}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer flex items-center gap-1"
                    >
                      <Calendar className="w-3.5 h-3.5 text-brand-600" />
                      Cobro por Rango
                    </button>

                    <button
                      onClick={() => abrirModalCobroParaCliente(t.clienteId, 'individual', t.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      💰 Cobrar este Turno
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Cobro */}
      <ModalCobro
        isOpen={modalCobroOpen}
        onClose={() => setModalCobroOpen(false)}
        modoInicial={modalCobroModo}
        clienteIdInicial={clienteIdCobro}
        turnoIdInicial={turnoIdCobro}
      />
    </div>
  );
};
