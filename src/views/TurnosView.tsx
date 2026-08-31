import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Turno } from '../types';
import { formatearMoneda } from '../utils/formatters';
import { formatearFechaCorta } from '../utils/dateUtils';
import { 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Edit, 
  AlertCircle, 
  DollarSign, 
  User, 
  Calendar 
} from 'lucide-react';
import { ModalEditarTurno } from '../components/ModalEditarTurno';
import { ModalCobro } from '../components/ModalCobro';

interface TurnosViewProps {
  onOpenAgregarTurno: () => void;
}

export const TurnosView: React.FC<TurnosViewProps> = ({ onOpenAgregarTurno }) => {
  const { turnos, clientes } = useApp();

  const [busqueda, setBusqueda] = useState('');
  const [filtroClienteId, setFiltroClienteId] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  
  const [turnoAEditar, setTurnoAEditar] = useState<Turno | null>(null);
  const [modalCobroOpen, setModalCobroOpen] = useState(false);
  const [turnoIdACobrar, setTurnoIdACobrar] = useState<string | undefined>(undefined);

  // Filtrado de turnos
  const turnosFiltrados = turnos.filter(t => {
    // Búsqueda por cliente u observación
    const coincideTexto = 
      t.clienteNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (t.observaciones && t.observaciones.toLowerCase().includes(busqueda.toLowerCase())) ||
      t.fecha.includes(busqueda);

    // Filtro por cliente
    const coincideCliente = filtroClienteId === 'todos' || t.clienteId === filtroClienteId;

    // Filtro por estado
    const coincideEstado = filtroEstado === 'todos' || t.estado === filtroEstado;

    return coincideTexto && coincideCliente && coincideEstado;
  }).sort((a, b) => b.fecha.localeCompare(a.fecha) || b.fechaCreacion.localeCompare(a.fechaCreacion));

  // Resumen del listado actual
  const totalGeneradoFiltrado = turnosFiltrados.reduce((s, t) => t.estado !== 'Anulado' ? s + t.valor : s, 0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Header Turnos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-600" />
            Registro y Control de Turnos
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Historial cronológico, observaciones por turno y estados financieros
          </p>
        </div>

        <button
          onClick={onOpenAgregarTurno}
          className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-md shadow-brand-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Registrar Turno
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Buscador */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por cliente u observación..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Filtro Cliente */}
          <div>
            <select
              value={filtroClienteId}
              onChange={(e) => setFiltroClienteId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="todos">Todos los Clientes</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          {/* Filtro Estado */}
          <div>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="todos">Todos los Estados</option>
              <option value="Por cobrar">Por cobrar</option>
              <option value="Cobrado">Cobrado</option>
              <option value="Realizado">Realizado</option>
              <option value="Anulado">Anulado</option>
            </select>
          </div>
        </div>

        {/* Resumen rápido de turnos filtrados */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 font-semibold text-slate-500">
          <span>Mostrando {turnosFiltrados.length} turno(s)</span>
          <span>Total en lista: <strong className="text-brand-700 font-extrabold">{formatearMoneda(totalGeneradoFiltrado)}</strong></span>
        </div>
      </div>

      {/* Lista de Turnos */}
      {turnosFiltrados.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
          <Clock className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="text-sm font-bold text-slate-700">No se encontraron turnos</div>
          <p className="text-xs text-slate-400">Prueba cambiando los filtros de búsqueda o agrega un nuevo turno.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {turnosFiltrados.map(t => {
            const isPending = t.estado === 'Por cobrar' || t.estado === 'Realizado';

            return (
              <div
                key={t.id}
                className={`bg-white rounded-3xl p-5 border shadow-xs card-hover flex flex-col justify-between space-y-3 ${
                  t.estado === 'Cobrado' 
                    ? 'border-emerald-200/80 bg-gradient-to-b from-white to-emerald-50/20' 
                    : t.estado === 'Anulado'
                    ? 'border-rose-200/80 opacity-60 bg-rose-50/10'
                    : 'border-slate-200/80'
                }`}
              >
                {/* Header card */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-black text-sm text-slate-900">{t.clienteNombre}</h4>
                      <div className="text-xs text-slate-500 font-medium">
                        {formatearFechaCorta(t.fecha)} — <strong className="text-slate-700">{t.diaSemana}</strong>
                      </div>
                    </div>

                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                      t.estado === 'Cobrado' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : t.estado === 'Anulado'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {t.estado}
                    </span>
                  </div>

                  {/* Observaciones (Requisito Sec 5: Observaciones por turno) */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Observación:
                    </span>
                    {t.observaciones ? (
                      <span className="text-slate-700 italic">"{t.observaciones}"</span>
                    ) : (
                      <span className="text-slate-400 italic">Sin observaciones</span>
                    )}
                  </div>
                </div>

                {/* Footer card con valor y acciones */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Valor</span>
                    <span className="text-base font-black text-slate-900">{formatearMoneda(t.valor)}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isPending && (
                      <button
                        onClick={() => {
                          setTurnoIdACobrar(t.id);
                          setModalCobroOpen(true);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs cursor-pointer"
                      >
                        💰 Cobrar
                      </button>
                    )}
                    <button
                      onClick={() => setTurnoAEditar(t)}
                      className="p-2 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors cursor-pointer"
                      title="Editar observaciones o anular"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modales */}
      <ModalEditarTurno
        isOpen={Boolean(turnoAEditar)}
        onClose={() => setTurnoAEditar(null)}
        turno={turnoAEditar}
      />

      <ModalCobro
        isOpen={modalCobroOpen}
        onClose={() => setModalCobroOpen(false)}
        modoInicial="individual"
        turnoIdInicial={turnoIdACobrar}
      />
    </div>
  );
};
