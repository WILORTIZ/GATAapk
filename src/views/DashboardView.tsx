import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatearMoneda } from '../utils/formatters';
import { formatearFechaCorta, getHoyFechaStr, getNombreMes } from '../utils/dateUtils';
import { 
  Calendar, 
  RotateCw, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  Wallet, 
  Plus, 
  ArrowUpRight, 
  Users, 
  Clock, 
  ChevronRight,
  TrendingUp,
  FileText,
  CreditCard
} from 'lucide-react';
import { ModalCobro } from '../components/ModalCobro';
import { ModalEditarTurno } from '../components/ModalEditarTurno';
import { Turno } from '../types';

interface DashboardViewProps {
  onOpenAgregarTurno: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenAgregarTurno }) => {
  const { 
    turnos, 
    clientes, 
    metricas, 
    setVistaActiva, 
    setClienteSeleccionadoId 
  } = useApp();

  const [modalCobroOpen, setModalCobroOpen] = useState(false);
  const [modalCobroModo, setModalCobroModo] = useState<'individual' | 'multiples' | 'rango' | 'parcial' | 'todo'>('individual');
  const [turnoEditar, setTurnoEditar] = useState<Turno | null>(null);

  const mesActual = getNombreMes(new Date().getMonth() + 1);
  const anioActual = new Date().getFullYear();

  // Clientes con deuda pendiente
  const clientesConDeuda = clientes.map(c => {
    const turnosPendientes = turnos.filter(t => 
      t.clienteId === c.id && 
      (t.estado === 'Por cobrar' || t.estado === 'Realizado')
    );
    const totalDeuda = turnosPendientes.reduce((sum, t) => sum + t.valor, 0);
    return {
      cliente: c,
      turnosPendientesCount: turnosPendientes.length,
      totalDeuda
    };
  }).filter(item => item.totalDeuda > 0).sort((a, b) => b.totalDeuda - a.totalDeuda);

  // Últimos turnos registrados
  const ultimosTurnos = [...turnos]
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.fechaCreacion.localeCompare(a.fechaCreacion))
    .slice(0, 6);

  const abrirCobroModo = (modo: 'individual' | 'multiples' | 'rango' | 'parcial' | 'todo') => {
    setModalCobroModo(modo);
    setModalCobroOpen(true);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* BANNER PRINCIPAL CON BOTÓN DESTACADO "+ AGREGAR TURNO DE HOY" */}
      <div className="bg-gradient-to-br from-brand-600 via-emerald-600 to-teal-700 rounded-3xl p-5 sm:p-7 text-white shadow-xl shadow-brand-600/15 relative overflow-hidden">
        {/* Glow decorative */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold text-white/95">
              <span>{mesActual} {anioActual}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Bienvenido a GATA
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium max-w-md">
              Control de turnos, cálculo automático de ingresos y cuentas por cobrar independientes por cliente.
            </p>
          </div>

          {/* BOTÓN DESTACADO AGREGAR TURNO DE HOY */}
          <button
            onClick={onOpenAgregarTurno}
            className="group flex items-center justify-center gap-3 bg-white text-brand-800 hover:bg-brand-50 active:scale-95 px-6 py-4 rounded-2xl shadow-xl font-extrabold text-sm sm:text-base transition-all transform hover:-translate-y-0.5 cursor-pointer shrink-0"
          >
            <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5 stroke-[3]" />
            </div>
            <div className="text-left">
              <div className="leading-tight">➕ AGREGAR TURNO DE HOY</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Acceso Rápido</div>
            </div>
          </button>
        </div>
      </div>

      {/* 6 MÉTRICAS PRINCIPALES EXIGIDAS EN EL PDF */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        
        {/* 1. TURNOS DE HOY */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs card-hover flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-500" />
              Turnos de Hoy
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              Hoy
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {metricas.turnosHoy}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">
              Turnos realizados hoy
            </div>
          </div>
        </div>

        {/* 2. TURNOS DEL MES */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs card-hover flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <RotateCw className="w-4 h-4 text-indigo-500" />
              Turnos del Mes
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {mesActual}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {metricas.turnosMes}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">
              Total acumulado del mes
            </div>
          </div>
        </div>

        {/* 3. GENERADO ESTE MES */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs card-hover flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Generado Este Mes
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
              Total Mes
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {formatearMoneda(metricas.generadoMes)}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">
              Valor de turnos realizados
            </div>
          </div>
        </div>

        {/* 4. POR COBRAR (🔴) */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-rose-200/80 shadow-xs card-hover flex flex-col justify-between bg-gradient-to-br from-white to-rose-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block" />
              Por Cobrar
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
              Pendiente
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-rose-600">
              {formatearMoneda(metricas.porCobrarTotal)}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              Dinero pendiente de cobro
            </div>
          </div>
        </div>

        {/* 5. COBRADO (🟢) */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-emerald-200/80 shadow-xs card-hover flex flex-col justify-between bg-gradient-to-br from-white to-emerald-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Cobrado
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Recibido
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">
              {formatearMoneda(metricas.cobradoTotal)}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              Dinero efectivamente recibido
            </div>
          </div>
        </div>

        {/* 6. SALDO A FAVOR (💵) */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-teal-200/80 shadow-xs card-hover flex flex-col justify-between bg-gradient-to-br from-white to-teal-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-teal-600" />
              Saldo a Favor
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
              Acumulado
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-teal-700">
              {formatearMoneda(metricas.saldoAFavorTotal)}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              Total acumulado cobrado
            </div>
          </div>
        </div>

      </div>

      {/* ACCESOS RÁPIDOS DE COBRO (SECCIÓN 32 DEL PDF) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-brand-600" />
            Acciones Rápidas de Cobro
          </h3>
          <span className="text-xs text-slate-400">Flexibilidad total</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => abrirCobroModo('individual')}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200/80 text-left transition-all cursor-pointer group"
          >
            <div className="text-xs font-extrabold text-slate-800 group-hover:text-emerald-700">
              💰 COBRAR TURNO
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Individual</div>
          </button>

          <button
            onClick={() => abrirCobroModo('multiples')}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200/80 text-left transition-all cursor-pointer group"
          >
            <div className="text-xs font-extrabold text-slate-800 group-hover:text-emerald-700">
              💰 COBRAR SELECCIONADOS
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Varios a la vez</div>
          </button>

          <button
            onClick={() => abrirCobroModo('rango')}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200/80 text-left transition-all cursor-pointer group"
          >
            <div className="text-xs font-extrabold text-slate-800 group-hover:text-emerald-700">
              💰 COBRAR POR RANGO
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Desde / Hasta</div>
          </button>

          <button
            onClick={() => abrirCobroModo('todo')}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200/80 text-left transition-all cursor-pointer group"
          >
            <div className="text-xs font-extrabold text-slate-800 group-hover:text-emerald-700">
              💰 COBRAR TODO
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Saldo total cliente</div>
          </button>
        </div>
      </div>

      {/* SECCIÓN DOBLE: CLIENTES CON CUENTAS PENDIENTES & ÚLTIMOS TURNOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CLIENTES CON DEUDA PENDIENTE */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                <AlertCircle className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Clientes con Cuentas Pendientes
              </h3>
            </div>
            <button
              onClick={() => setVistaActiva('por_cobrar')}
              className="text-xs text-brand-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Ver todas <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {clientesConDeuda.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">¡Al día! No hay cuentas por cobrar pendientes.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {clientesConDeuda.map(item => (
                <div
                  key={item.cliente.id}
                  onClick={() => {
                    setClienteSeleccionadoId(item.cliente.id);
                    setVistaActiva('clientes');
                  }}
                  className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100/80 transition-all flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-slate-800">
                      {item.cliente.nombre}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {item.turnosPendientesCount} turno(s) sin cobrar
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-sm text-rose-600">
                      {formatearMoneda(item.totalDeuda)}
                    </div>
                    <span className="text-[10px] text-brand-600 font-bold flex items-center gap-0.5 justify-end">
                      Ver cliente <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ÚLTIMOS TURNOS REGISTRADOS */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Últimos Turnos Registrados
              </h3>
            </div>
            <button
              onClick={() => setVistaActiva('turnos')}
              className="text-xs text-brand-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Ver todos <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {ultimosTurnos.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">No hay turnos registrados aún.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {ultimosTurnos.map(t => (
                <div
                  key={t.id}
                  onClick={() => setTurnoEditar(t)}
                  className="p-3 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-800">{t.clienteNombre}</span>
                      <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
                        {formatearFechaCorta(t.fecha)} ({t.diaSemana})
                      </span>
                    </div>
                    {t.observaciones ? (
                      <div className="text-[11px] text-slate-600 italic flex items-center gap-1 max-w-[220px] sm:max-w-xs truncate">
                        <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                        "{t.observaciones}"
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic">
                        Sin observaciones
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-black text-xs sm:text-sm text-slate-900">
                      {formatearMoneda(t.valor)}
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                      t.estado === 'Cobrado' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : t.estado === 'Anulado'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {t.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* MODALES */}
      <ModalCobro
        isOpen={modalCobroOpen}
        onClose={() => setModalCobroOpen(false)}
        modoInicial={modalCobroModo}
      />

      <ModalEditarTurno
        isOpen={Boolean(turnoEditar)}
        onClose={() => setTurnoEditar(null)}
        turno={turnoEditar}
      />
    </div>
  );
};
