import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNavigation } from './components/BottomNavigation';
import { DesktopSidebar, MenuDrawer } from './components/Sidebar';
import { ModalAgregarTurnoHoy } from './components/ModalAgregarTurnoHoy';
import { DashboardView } from './views/DashboardView';
import { ClientesView } from './views/ClientesView';
import { CalendarioView } from './views/CalendarioView';
import { TurnosView } from './views/TurnosView';
import { PorCobrarView } from './views/PorCobrarView';
import { SaldoAFavorView } from './views/SaldoAFavorView';
import { CierresView } from './views/CierresView';
import { ReportesView } from './views/ReportesView';
import { ConfiguracionView } from './views/ConfiguracionView';

export const App: React.FC = () => {
  const { vistaActiva } = useApp();
  const [modalAgregarTurnoOpen, setModalAgregarTurnoOpen] = useState(false);
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);

  const renderVista = () => {
    switch (vistaActiva) {
      case 'inicio':
        return <DashboardView onOpenAgregarTurno={() => setModalAgregarTurnoOpen(true)} />;
      case 'clientes':
        return <ClientesView />;
      case 'calendario':
        return <CalendarioView onOpenAgregarTurno={() => setModalAgregarTurnoOpen(true)} />;
      case 'turnos':
        return <TurnosView onOpenAgregarTurno={() => setModalAgregarTurnoOpen(true)} />;
      case 'por_cobrar':
        return <PorCobrarView />;
      case 'saldo_a_favor':
        return <SaldoAFavorView />;
      case 'cierres':
        return <CierresView />;
      case 'reportes':
        return <ReportesView />;
      case 'configuracion':
        return <ConfiguracionView />;
      default:
        return <DashboardView onOpenAgregarTurno={() => setModalAgregarTurnoOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar onOpenAgregarTurno={() => setModalAgregarTurnoOpen(true)} />

      {/* Main Layout (Sidebar on desktop + Scrollable content area) */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <DesktopSidebar />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full pb-24 md:pb-12">
          {renderVista()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation onOpenMoreMenu={() => setMenuDrawerOpen(true)} />

      {/* Mobile More Options Drawer */}
      <MenuDrawer
        isOpen={menuDrawerOpen}
        onClose={() => setMenuDrawerOpen(false)}
      />

      {/* Global Quick Add Shift Modal */}
      <ModalAgregarTurnoHoy
        isOpen={modalAgregarTurnoOpen}
        onClose={() => setModalAgregarTurnoOpen(false)}
      />
    </div>
  );
};

export default App;
