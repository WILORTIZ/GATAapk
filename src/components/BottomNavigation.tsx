import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Home, 
  Users, 
  Calendar, 
  Clock, 
  CircleDollarSign, 
  MoreHorizontal 
} from 'lucide-react';
import { VistaActiva } from '../types';

interface BottomNavigationProps {
  onOpenMoreMenu: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ onOpenMoreMenu }) => {
  const { vistaActiva, setVistaActiva, metricas } = useApp();

  const navItems: Array<{
    id: VistaActiva;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
  }> = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'calendario', label: 'Calendario', icon: Calendar },
    { id: 'turnos', label: 'Turnos', icon: Clock },
    { 
      id: 'por_cobrar', 
      label: 'Por Cobrar', 
      icon: CircleDollarSign, 
      badge: metricas.porCobrarTotal > 0 ? '!' : undefined 
    },
  ];

  const isMoreActive = ['saldo_a_favor', 'cierres', 'reportes', 'configuracion'].includes(vistaActiva);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 md:hidden pb-nav-safe shadow-lg shadow-slate-900/10">
      <nav className="flex items-center justify-around px-1 pt-2 pb-1 max-w-lg mx-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = vistaActiva === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setVistaActiva(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all relative cursor-pointer ${
                isActive 
                  ? 'text-brand-600 font-black scale-105' 
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate">
                {item.label}
              </span>
              {isActive && (
                <div className="w-5 h-1 bg-brand-500 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}

        {/* Botón 'Más' */}
        <button
          onClick={onOpenMoreMenu}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
            isMoreActive 
              ? 'text-brand-600 font-black scale-105' 
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <MoreHorizontal className={`w-5 h-5 ${isMoreActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-1 tracking-tight">Más</span>
          {isMoreActive && (
            <div className="w-5 h-1 bg-brand-500 rounded-full mt-0.5" />
          )}
        </button>
      </nav>
    </div>
  );
};
