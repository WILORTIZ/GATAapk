import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Home, 
  Users, 
  Calendar, 
  Clock, 
  CircleDollarSign, 
  Wallet, 
  FolderLock, 
  BarChart3, 
  Settings,
  X
} from 'lucide-react';
import { VistaActiva } from '../types';
import { formatearMoneda } from '../utils/formatters';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({ isOpen, onClose }) => {
  const { vistaActiva, setVistaActiva } = useApp();

  if (!isOpen) return null;

  const extraItems: Array<{ id: VistaActiva; label: string; desc: string; icon: React.ElementType; color: string }> = [
    { id: 'saldo_a_favor', label: 'Saldo a Favor e Ingresos', desc: 'Historial de pagos y cobros acumulados', icon: Wallet, color: 'text-emerald-600 bg-emerald-50' },
    { id: 'cierres', label: 'Cierres Mensuales', desc: 'Consolidado mensual y cierres históricos', icon: FolderLock, color: 'text-amber-600 bg-amber-50' },
    { id: 'reportes', label: 'Reportes Financieros', desc: 'Análisis por día, mes, cliente y año', icon: BarChart3, color: 'text-blue-600 bg-blue-50' },
    { id: 'configuracion', label: 'Configuración y Respaldos', desc: 'Copia de seguridad y ajustes de la app', icon: Settings, color: 'text-slate-600 bg-slate-100' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-t-3xl p-5 shadow-2xl border-t border-slate-200 animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-base">Opciones Adicionales</h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2.5 mt-3">
          {extraItems.map(item => {
            const Icon = item.icon;
            const isSelected = vistaActiva === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setVistaActiva(item.id);
                  onClose();
                }}
                className={`flex items-center gap-3.5 p-3 rounded-2xl text-left transition-all ${
                  isSelected 
                    ? 'bg-brand-50 border border-brand-200' 
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className={`text-sm font-semibold ${isSelected ? 'text-brand-900' : 'text-slate-800'}`}>
                    {item.label}
                  </div>
                  <div className="text-xs text-slate-500 font-normal">
                    {item.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const DesktopSidebar: React.FC = () => {
  const { vistaActiva, setVistaActiva, metricas } = useApp();

  const menuGroups: Array<{
    title: string;
    items: Array<{ id: VistaActiva; label: string; icon: React.ElementType; badge?: string }>;
  }> = [
    {
      title: 'Principal',
      items: [
        { id: 'inicio', label: 'Inicio (Dashboard)', icon: Home },
        { id: 'clientes', label: 'Clientes', icon: Users },
        { id: 'turnos', label: 'Control de Turnos', icon: Clock },
        { id: 'calendario', label: 'Calendario Visual', icon: Calendar },
      ]
    },
    {
      title: 'Gestión Financiera',
      items: [
        { 
          id: 'por_cobrar', 
          label: 'Por Cobrar', 
          icon: CircleDollarSign, 
          badge: metricas.porCobrarTotal > 0 ? formatearMoneda(metricas.porCobrarTotal) : undefined 
        },
        { id: 'saldo_a_favor', label: 'Saldo a Favor / Historial', icon: Wallet },
        { id: 'cierres', label: 'Cierres Mensuales', icon: FolderLock },
        { id: 'reportes', label: 'Reportes y Métricas', icon: BarChart3 },
      ]
    },
    {
      title: 'Sistema',
      items: [
        { id: 'configuracion', label: 'Configuración', icon: Settings }
      ]
    }
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-white min-h-[calc(100vh-61px)] p-4 shrink-0">
      <div className="space-y-6">
        {menuGroups.map((group, idx) => (
          <div key={idx}>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              {group.title}
            </div>
            <div className="space-y-1">
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = vistaActiva === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setVistaActiva(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5] text-brand-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Mini financial quick box */}
      <div className="mt-auto pt-6">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/50 border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Saldo Cobrado (Total)</div>
          <div className="text-lg font-black text-emerald-700 mt-0.5">
            {formatearMoneda(metricas.saldoAFavorTotal)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Hoy: {metricas.turnosHoy} turnos</span>
            <span className="text-brand-600 font-semibold">100% offline</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
