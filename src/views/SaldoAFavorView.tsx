import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Cobro } from '../types';
import { formatearMoneda } from '../utils/formatters';
import { formatearFechaCorta, formatearFechaCompleta } from '../utils/dateUtils';
import { 
  Wallet, 
  Search, 
  CreditCard, 
  FileText, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2,
  Calendar,
  Layers,
  Trash2
} from 'lucide-react';

export const SaldoAFavorView: React.FC = () => {
  const { cobros, metricas, anularCobro } = useApp();

  const [busqueda, setBusqueda] = useState('');
  const [filtroMetodo, setFiltroMetodo] = useState('todos');
  const [cobroAAnularId, setCobroAAnularId] = useState<string | null>(null);

  // Cobros filtrados
  const cobrosFiltrados = cobros.filter(c => {
    const coincideTexto = 
      c.clienteNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.id.toLowerCase().includes(busqueda.toLowerCase()) ||
      (c.observacion && c.observacion.toLowerCase().includes(busqueda.toLowerCase()));

    const coincideMetodo = filtroMetodo === 'todos' || c.metodo === filtroMetodo;

    return coincideTexto && coincideMetodo;
  }).sort((a, b) => b.fechaPago.localeCompare(a.fechaPago) || b.fechaRegistro.localeCompare(a.fechaRegistro));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Header Saldo a Favor (Sección 21 del PDF) */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-xl shadow-emerald-600/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider flex items-center gap-1.5">
            <Wallet className="w-4 h-4" />
            Ingresos y Recaudos
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            💵 SALDO A FAVOR
          </h2>
          <p className="text-xs text-emerald-100 font-medium">
            Total acumulado de dinero efectivamente recibido y registrado
          </p>
        </div>

        {/* TOTAL ACUMULADO */}
        <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20 sm:text-right">
          <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider block">
            SALDO ACUMULADO
          </span>
          <span className="text-2xl sm:text-3xl font-black text-white">
            {formatearMoneda(metricas.saldoAFavorTotal)}
          </span>
        </div>
      </div>

      {/* 19. HISTORIAL DE COBROS */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Historial Detallado de Cobros
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Registro trazable de cada pago recibido
            </p>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar cobro..."
                className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={filtroMetodo}
              onChange={(e) => setFiltroMetodo(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="todos">Todos los Métodos</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Nequi">Nequi</option>
              <option value="Daviplata">Daviplata</option>
              <option value="Bancolombia">Bancolombia</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
        </div>

        {/* Tabla o Lista de Cobros */}
        {cobrosFiltrados.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <CreditCard className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-700">No hay registros de cobros</div>
            <p className="text-xs text-slate-400">Los pagos que registres aparecerán aquí con su detalle completo.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cobrosFiltrados.map(cobro => {
              const esAnulado = cobro.estado === 'Anulado';

              return (
                <div
                  key={cobro.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    esAnulado
                      ? 'bg-rose-50/20 border-rose-200 opacity-60'
                      : 'bg-white border-slate-200 hover:border-emerald-200 shadow-xs'
                  }`}
                >
                  {/* Izquierda: Cliente, ID, Fecha */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">{cobro.clienteNombre}</span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-mono">
                        {cobro.id}
                      </span>
                      {esAnulado && (
                        <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                          Anulado
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        {formatearFechaCorta(cobro.fechaPago)}
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        {cobro.metodo}
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        {cobro.turnoIds.length} turno(s) cubierto(s)
                      </span>
                    </div>

                    {cobro.rangoFechas && (
                      <div className="text-[11px] text-emerald-700 font-semibold">
                        Rango: {formatearFechaCorta(cobro.rangoFechas.desde)} al {formatearFechaCorta(cobro.rangoFechas.hasta)}
                      </div>
                    )}

                    {cobro.observacion && (
                      <div className="text-xs text-slate-600 italic mt-0.5">
                        "{cobro.observacion}"
                      </div>
                    )}
                  </div>

                  {/* Derecha: Monto y Acción Anular (Sección 28) */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Monto</span>
                      <span className="text-lg font-black text-emerald-700">{formatearMoneda(cobro.valor)}</span>
                    </div>

                    {!esAnulado && (
                      <div>
                        {cobroAAnularId === cobro.id ? (
                          <div className="flex items-center gap-1.5 animate-in fade-in">
                            <button
                              onClick={() => {
                                anularCobro(cobro.id);
                                setCobroAAnularId(null);
                              }}
                              className="text-[11px] bg-rose-600 hover:bg-rose-700 text-white font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                            >
                              Confirmar Anular
                            </button>
                            <button
                              onClick={() => setCobroAAnularId(null)}
                              className="text-[11px] bg-slate-200 text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-300 transition-colors cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setCobroAAnularId(cobro.id)}
                            className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Anular Cobro
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
