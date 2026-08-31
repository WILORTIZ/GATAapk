import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Cliente, Turno } from '../types';
import { formatearMoneda } from '../utils/formatters';
import { formatearFechaCorta } from '../utils/dateUtils';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  MapPin, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  CreditCard, 
  FileText, 
  Clock, 
  Edit, 
  ArrowLeft,
  Filter
} from 'lucide-react';
import { ModalNuevoCliente } from '../components/ModalNuevoCliente';
import { ModalCobro } from '../components/ModalCobro';
import { ModalEditarTurno } from '../components/ModalEditarTurno';

export const ClientesView: React.FC = () => {
  const { 
    clientes, 
    turnos, 
    clienteSeleccionadoId, 
    setClienteSeleccionadoId, 
    getClienteStats 
  } = useApp();

  const [busqueda, setBusqueda] = useState('');
  const [modalNuevoClienteOpen, setModalNuevoClienteOpen] = useState(false);
  const [clienteAEditar, setClienteAEditar] = useState<Cliente | null>(null);

  // Modal de cobro state
  const [modalCobroOpen, setModalCobroOpen] = useState(false);
  const [modalCobroModo, setModalCobroModo] = useState<'individual' | 'multiples' | 'rango' | 'parcial' | 'todo'>('individual');
  const [turnoIdCobro, setTurnoIdCobro] = useState<string | undefined>(undefined);
  const [turnosSeleccionadosIds, setTurnosSeleccionadosIds] = useState<string[]>([]);
  
  // Modal de editar turno
  const [turnoAEditar, setTurnoAEditar] = useState<Turno | null>(null);

  // Filtro de estado para listado de turnos de un cliente
  const [filtroEstadoTurno, setFiltroEstadoTurno] = useState<'todos' | 'Por cobrar' | 'Cobrado' | 'Anulado'>('todos');

  // Cliente activo en detalle
  const clienteActivo = clientes.find(c => c.id === clienteSeleccionadoId) || null;

  // Clientes filtrados por búsqueda
  const clientesFiltrados = clientes.filter(c => 
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.identificacion && c.identificacion.toLowerCase().includes(busqueda.toLowerCase())) ||
    c.telefono.includes(busqueda)
  );

  const toggleSelectTurno = (id: string) => {
    setTurnosSeleccionadosIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const abrirCobro = (modo: 'individual' | 'multiples' | 'rango' | 'parcial' | 'todo', turnoId?: string) => {
    setModalCobroModo(modo);
    setTurnoIdCobro(turnoId);
    setModalCobroOpen(true);
  };

  // VISTA 1: DETALLE INDIVIDUAL DE CLIENTE (Secciones 9, 11, 12, 13, 14, 15 del PDF)
  if (clienteActivo) {
    const stats = getClienteStats(clienteActivo.id);

    // Turnos del cliente
    const turnosCliente = turnos
      .filter(t => t.clienteId === clienteActivo.id)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));

    // Turnos filtrados para la tabla
    const turnosTabla = turnosCliente.filter(t => {
      if (filtroEstadoTurno === 'todos') return true;
      return t.estado === filtroEstadoTurno;
    });

    const turnosPendientes = turnosCliente.filter(t => t.estado === 'Por cobrar' || t.estado === 'Realizado');

    return (
      <div className="space-y-6 pb-12 animate-in fade-in duration-200">
        
        {/* Top bar with back button */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              setClienteSeleccionadoId(null);
              setTurnosSeleccionadosIds([]);
            }}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la lista de Clientes
          </button>

          <button
            onClick={() => {
              setClienteAEditar(clienteActivo);
              setModalNuevoClienteOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3.5 py-2 rounded-xl shadow-xs cursor-pointer"
          >
            <Edit className="w-4 h-4" />
            Editar Cliente
          </button>
        </div>

        {/* 11. CUENTA INDIVIDUAL POR CLIENTE */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                {clienteActivo.nombre.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    {clienteActivo.nombre}
                  </h2>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    clienteActivo.estado === 'Activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {clienteActivo.estado}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                  {clienteActivo.identificacion && (
                    <span>ID: <strong className="text-slate-700">{clienteActivo.identificacion}</strong></span>
                  )}
                  {clienteActivo.telefono && (
                    <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {clienteActivo.telefono}</span>
                  )}
                  {clienteActivo.direccion && (
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {clienteActivo.direccion}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Valor actual del turno */}
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3 sm:text-right">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                Valor Actual del Turno
              </span>
              <span className="text-xl font-black text-blue-900">
                {formatearMoneda(clienteActivo.valorTurnoActual)}
              </span>
            </div>
          </div>

          {/* Estadísticas individuales del cliente (PDF Sec 11) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Turnos</span>
              <span className="text-xl font-black text-slate-800">{stats.cantidadTurnos}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Días Trabajados</span>
              <span className="text-xl font-black text-slate-800">{stats.diasTrabajados}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Generado</span>
              <span className="text-lg font-black text-slate-900">{formatearMoneda(stats.generado)}</span>
            </div>
            <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Cobrado</span>
              <span className="text-lg font-black text-emerald-700">{formatearMoneda(stats.cobrado)}</span>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-rose-50 p-3 rounded-2xl border border-rose-100">
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">Por Cobrar</span>
              <span className="text-lg font-black text-rose-600">{formatearMoneda(stats.pendiente)}</span>
            </div>
          </div>

          {/* Botones de acción de cobro exclusivo para este cliente */}
          <div className="pt-2 flex flex-wrap gap-2">
            <button
              onClick={() => abrirCobro('rango')}
              disabled={turnosPendientes.length === 0}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              Cobrar por Rango de Fechas
            </button>

            {turnosSeleccionadosIds.length > 0 && (
              <button
                onClick={() => abrirCobro('multiples')}
                className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer animate-in zoom-in-95"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Cobrar {turnosSeleccionadosIds.length} Seleccionado(s)
              </button>
            )}

            <button
              onClick={() => abrirCobro('parcial')}
              disabled={turnosPendientes.length === 0}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <DollarSign className="w-3.5 h-3.5" />
              Abono / Pago Parcial
            </button>

            <button
              onClick={() => abrirCobro('todo')}
              disabled={turnosPendientes.length === 0}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Cobrar Todo el Saldo
            </button>
          </div>
        </div>

        {/* 9. SECCIÓN DÍAS TRABAJADOS (Cronológico) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-600" />
              📅 DÍAS TRABAJADOS
            </h3>
            <span className="text-xs text-slate-500 font-semibold">
              {stats.diasTrabajados} días registrados
            </span>
          </div>

          {/* Listado con formato del PDF: 03/08/2026 — Lunes — $100.000 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {turnosCliente.map(t => (
              <div 
                key={t.id} 
                className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                  t.estado === 'Cobrado' 
                    ? 'bg-emerald-50/40 border-emerald-100' 
                    : t.estado === 'Anulado'
                    ? 'bg-rose-50/40 border-rose-100 opacity-60'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-800">
                    {formatearFechaCorta(t.fecha)} — <span className="text-brand-700">{t.diaSemana}</span>
                  </div>
                  {t.observaciones && (
                    <div className="text-[11px] text-slate-500 italic truncate max-w-[170px]">
                      {t.observaciones}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-slate-900">{formatearMoneda(t.valor)}</div>
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full ${
                    t.estado === 'Cobrado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {t.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 12. LISTADO DE TURNOS DEL CLIENTE (Tabla con Checkboxes y Filtros) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-extrabold text-slate-900 text-base">
              Listado de Turnos y Cobro
            </h3>

            {/* Filtros de estado */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {(['todos', 'Por cobrar', 'Cobrado', 'Anulado'] as const).map(filtro => (
                <button
                  key={filtro}
                  onClick={() => setFiltroEstadoTurno(filtro)}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    filtroEstadoTurno === filtro 
                      ? 'bg-white text-slate-900 shadow-xs font-bold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {filtro === 'todos' ? 'Todos' : filtro}
                </button>
              ))}
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3 w-10">
                    <input
                      type="checkbox"
                      checked={turnosPendientes.length > 0 && turnosPendientes.every(t => turnosSeleccionadosIds.includes(t.id))}
                      onChange={() => {
                        if (turnosPendientes.every(t => turnosSeleccionadosIds.includes(t.id))) {
                          setTurnosSeleccionadosIds([]);
                        } else {
                          setTurnosSeleccionadosIds(turnosPendientes.map(t => t.id));
                        }
                      }}
                      className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-3">Fecha</th>
                  <th className="py-3 px-3">Día</th>
                  <th className="py-3 px-3">Valor</th>
                  <th className="py-3 px-3">Estado</th>
                  <th className="py-3 px-3">Observación</th>
                  <th className="py-3 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {turnosTabla.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                      No hay turnos para mostrar con este filtro.
                    </td>
                  </tr>
                ) : (
                  turnosTabla.map(t => {
                    const isChecked = turnosSeleccionadosIds.includes(t.id);
                    const isPending = t.estado === 'Por cobrar' || t.estado === 'Realizado';

                    return (
                      <tr 
                        key={t.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          isChecked ? 'bg-emerald-50/50' : ''
                        }`}
                      >
                        <td className="py-3 px-3">
                          {isPending ? (
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelectTurno(t.id)}
                              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                            />
                          ) : (
                            <span className="w-4 h-4 inline-block" />
                          )}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-800">
                          {formatearFechaCorta(t.fecha)}
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-medium">
                          {t.diaSemana}
                        </td>
                        <td className="py-3 px-3 font-extrabold text-slate-900">
                          {formatearMoneda(t.valor)}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            t.estado === 'Cobrado' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : t.estado === 'Anulado'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {t.estado}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600 italic max-w-xs truncate">
                          {t.observaciones || <span className="text-slate-300">Sin observaciones</span>}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPending && (
                              <button
                                onClick={() => abrirCobro('individual', t.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] shadow-xs cursor-pointer"
                              >
                                💰 Cobrar
                              </button>
                            )}
                            <button
                              onClick={() => setTurnoAEditar(t)}
                              className="p-1 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors cursor-pointer"
                              title="Editar o Anular Turno"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modales */}
        <ModalCobro
          isOpen={modalCobroOpen}
          onClose={() => {
            setModalCobroOpen(false);
            setTurnosSeleccionadosIds([]);
          }}
          modoInicial={modalCobroModo}
          clienteIdInicial={clienteActivo.id}
          turnoIdInicial={turnoIdCobro}
          turnosIdsIniciales={turnosSeleccionadosIds}
        />

        <ModalNuevoCliente
          isOpen={modalNuevoClienteOpen}
          onClose={() => setModalNuevoClienteOpen(false)}
          clienteEditar={clienteAEditar}
        />

        <ModalEditarTurno
          isOpen={Boolean(turnoAEditar)}
          onClose={() => setTurnoAEditar(null)}
          turno={turnoAEditar}
        />
      </div>
    );
  }

  // VISTA 2: LISTADO GENERAL DE CLIENTES
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Header Clientes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Clientes Registrados
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Tarifas de turno y cuentas independientes por cliente
          </p>
        </div>

        <button
          onClick={() => {
            setClienteAEditar(null);
            setModalNuevoClienteOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-md shadow-brand-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Nuevo Cliente
        </button>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar cliente por nombre, cédula o teléfono..."
          className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
        />
      </div>

      {/* Grid de Tarjetas de Clientes */}
      {clientesFiltrados.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="text-sm font-bold text-slate-700">No se encontraron clientes</div>
          <p className="text-xs text-slate-400">Prueba con otro término de búsqueda o crea tu primer cliente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientesFiltrados.map(c => {
            const stats = getClienteStats(c.id);

            return (
              <div
                key={c.id}
                onClick={() => setClienteSeleccionadoId(c.id)}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs card-hover flex flex-col justify-between cursor-pointer group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white font-black text-base shadow-sm">
                        {c.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-brand-600 transition-colors">
                          {c.nombre}
                        </h4>
                        <div className="text-[11px] text-slate-400">
                          {c.identificacion || 'Sin ID'}
                        </div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      c.estado === 'Activo' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {c.estado}
                    </span>
                  </div>

                  {/* Valor del turno */}
                  <div className="bg-slate-50 p-2.5 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Tarifa actual:</span>
                    <span className="font-black text-slate-800">{formatearMoneda(c.valorTurnoActual)}</span>
                  </div>

                  {/* Balance */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                    <div className="bg-slate-50/70 p-2 rounded-xl">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Turnos</div>
                      <div className="font-extrabold text-slate-800">{stats.cantidadTurnos}</div>
                    </div>
                    <div className="bg-emerald-50/70 p-2 rounded-xl">
                      <div className="text-[10px] text-emerald-600 font-bold uppercase">Cobrado</div>
                      <div className="font-extrabold text-emerald-700">{formatearMoneda(stats.cobrado)}</div>
                    </div>
                    <div className="bg-rose-50/70 p-2 rounded-xl">
                      <div className="text-[10px] text-rose-600 font-bold uppercase">Por Cobrar</div>
                      <div className="font-extrabold text-rose-600">{formatearMoneda(stats.pendiente)}</div>
                    </div>
                  </div>
                </div>

                {/* Footer card */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-brand-600 font-bold">
                  <span>Ver ficha y días trabajados</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal nuevo cliente */}
      <ModalNuevoCliente
        isOpen={modalNuevoClienteOpen}
        onClose={() => setModalNuevoClienteOpen(false)}
        clienteEditar={clienteAEditar}
      />
    </div>
  );
};
