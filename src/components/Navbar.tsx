import React from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Bell, RefreshCw } from 'lucide-react';
import { formatearMoneda } from '../utils/formatters';

interface NavbarProps {
  onOpenAgregarTurno: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAgregarTurno }) => {
  const { vistaActiva, metricas } = useApp();

  const getTituloVista = () => {
    switch (vistaActiva) {
      case 'inicio': return 'Dashboard Principal';
      case 'clientes': return 'Gestión de Clientes';
      case 'calendario': return 'Calendario de Turnos';
      case 'turnos': return 'Control de Turnos';
      case 'por_cobrar': return 'Cuentas Por Cobrar';
      case 'saldo_a_favor': return 'Saldo a Favor e Ingresos';
      case 'cierres': return 'Cierres Mensuales';
      case 'reportes': return 'Reportes Financieros';
      case 'configuracion': return 'Configuración';
      default: return 'GATA';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Logo / Brand con Gato Garfield */}
        <div className="flex items-center gap-3">
          <img 
            src="/cat-icon.png" 
            alt="GATA Logo" 
            className="w-10 h-10 rounded-xl object-cover shadow-md shadow-amber-500/20 border border-amber-200"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg text-slate-900 tracking-tight leading-none">GATA</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium truncate max-w-[180px] sm:max-w-none">
              {getTituloVista()}
            </p>
          </div>
        </div>

        {/* Action Button & Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Pending Badge on Mobile */}
          {metricas.porCobrarTotal > 0 && (
            <div className="hidden xs:flex flex-col items-end px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-100 text-right">
              <span className="text-[10px] font-semibold text-rose-600 uppercase tracking-wider">Por Cobrar</span>
              <span className="text-xs font-bold text-rose-700">{formatearMoneda(metricas.porCobrarTotal)}</span>
            </div>
          )}

          {/* Quick Action Button */}
          <button
            onClick={onOpenAgregarTurno}
            className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-xl shadow-md shadow-brand-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Agregar Turno Hoy</span>
            <span className="sm:hidden">Turno</span>
          </button>
        </div>
      </div>
    </header>
  );
};
