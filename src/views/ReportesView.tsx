import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatearMoneda } from '../utils/formatters';
import { 
  formatearFechaCorta, 
  formatearFechaCompleta, 
  getNombreMes, 
  LISTA_MESES, 
  getHoyFechaStr 
} from '../utils/dateUtils';
import { 
  BarChart3, 
  Calendar, 
  Users, 
  Download, 
  Share2, 
  Printer, 
  Filter, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  FileText 
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const ReportesView: React.FC = () => {
  const { turnos, clientes, cobros } = useApp();

  const [tipoReporte, setTipoReporte] = useState<'dia' | 'mes' | 'cliente' | 'anio'>('mes');
  
  // Filtros
  const [fechaDia, setFechaDia] = useState<string>(getHoyFechaStr());
  const [mesReporte, setMesReporte] = useState<number>(() => new Date().getMonth() + 1);
  const [anioReporte, setAnioReporte] = useState<number>(() => new Date().getFullYear());
  const [clienteReporteId, setClienteReporteId] = useState<string>('todos');

  // Turnos no anulados
  const turnosValidos = useMemo(() => {
    return turnos.filter(t => t.estado !== 'Anulado');
  }, [turnos]);

  // 1. REPORTE POR DÍA (Sección 25)
  const datosPorDia = useMemo(() => {
    const turnosDelDia = turnosValidos.filter(t => t.fecha === fechaDia);
    const totalDia = turnosDelDia.reduce((sum, t) => sum + t.valor, 0);
    const cobradoDia = turnosDelDia.filter(t => t.estado === 'Cobrado').reduce((s, t) => s + t.valor, 0);
    const pendienteDia = turnosDelDia.filter(t => t.estado !== 'Cobrado').reduce((s, t) => s + t.valor, 0);

    return {
      turnos: turnosDelDia,
      total: totalDia,
      cobrado: cobradoDia,
      pendiente: pendienteDia
    };
  }, [turnosValidos, fechaDia]);

  // 2. REPORTE POR MES (Sección 25)
  const datosPorMes = useMemo(() => {
    const turnosDelMes = turnosValidos.filter(t => {
      const [anio, mes] = t.fecha.split('-').map(Number);
      return anio === anioReporte && mes === mesReporte;
    });

    const diasUnicos = new Set(turnosDelMes.map(t => t.fecha)).size;
    const totalGenerado = turnosDelMes.reduce((s, t) => s + t.valor, 0);
    const totalCobrado = turnosDelMes.filter(t => t.estado === 'Cobrado').reduce((s, t) => s + t.valor, 0);
    const totalPendiente = turnosDelMes.filter(t => t.estado !== 'Cobrado').reduce((s, t) => s + t.valor, 0);

    // Agrupación por cliente en el mes
    const porCliente = clientes.map(cli => {
      const turnosCli = turnosDelMes.filter(t => t.clienteId === cli.id);
      const diasCli = new Set(turnosCli.map(t => t.fecha)).size;
      const gen = turnosCli.reduce((s, t) => s + t.valor, 0);
      const cob = turnosCli.filter(t => t.estado === 'Cobrado').reduce((s, t) => s + t.valor, 0);
      const pen = turnosCli.filter(t => t.estado !== 'Cobrado').reduce((s, t) => s + t.valor, 0);

      return {
        cliente: cli,
        turnosCount: turnosCli.length,
        diasTrabajados: diasCli,
        generado: gen,
        cobrado: cob,
        pendiente: pen
      };
    }).filter(item => item.turnosCount > 0);

    return {
      turnosCount: turnosDelMes.length,
      diasTrabajados: diasUnicos,
      totalGenerado,
      totalCobrado,
      totalPendiente,
      porCliente
    };
  }, [turnosValidos, clientes, mesReporte, anioReporte]);

  // 3. REPORTE POR CLIENTE (Sección 25)
  const datosPorCliente = useMemo(() => {
    const clienteSeleccionado = clientes.find(c => c.id === clienteReporteId);
    
    let turnosCli = turnosValidos;
    if (clienteReporteId !== 'todos') {
      turnosCli = turnosValidos.filter(t => t.clienteId === clienteReporteId);
    }

    const fechasUnicas = new Set(turnosCli.map(t => t.fecha)).size;
    const totalGenerado = turnosCli.reduce((s, t) => s + t.valor, 0);
    const totalCobrado = turnosCli.filter(t => t.estado === 'Cobrado').reduce((s, t) => s + t.valor, 0);
    const totalPendiente = turnosCli.filter(t => t.estado !== 'Cobrado').reduce((s, t) => s + t.valor, 0);

    return {
      cliente: clienteSeleccionado,
      turnos: turnosCli.sort((a, b) => b.fecha.localeCompare(a.fecha)),
      turnosCount: turnosCli.length,
      diasTrabajados: fechasUnicas,
      totalGenerado,
      totalCobrado,
      totalPendiente
    };
  }, [turnosValidos, clientes, clienteReporteId]);

  // 4. REPORTE POR AÑO (Sección 25)
  const datosPorAnio = useMemo(() => {
    const turnosAnio = turnosValidos.filter(t => {
      const [anio] = t.fecha.split('-').map(Number);
      return anio === anioReporte;
    });

    const mesesResumen = LISTA_MESES.map(m => {
      const turnosMes = turnosAnio.filter(t => {
        const [, mes] = t.fecha.split('-').map(Number);
        return mes === m.numero;
      });

      const gen = turnosMes.reduce((s, t) => s + t.valor, 0);
      const cob = turnosMes.filter(t => t.estado === 'Cobrado').reduce((s, t) => s + t.valor, 0);
      const pen = turnosMes.filter(t => t.estado !== 'Cobrado').reduce((s, t) => s + t.valor, 0);

      return {
        mes: m.nombre,
        numero: m.numero,
        turnosCount: turnosMes.length,
        diasTrabajados: new Set(turnosMes.map(t => t.fecha)).size,
        generado: gen,
        cobrado: cob,
        pendiente: pen
      };
    });

    const totalAnualGenerado = turnosAnio.reduce((s, t) => s + t.valor, 0);
    const totalAnualCobrado = turnosAnio.filter(t => t.estado === 'Cobrado').reduce((s, t) => s + t.valor, 0);
    const totalAnualPendiente = turnosAnio.filter(t => t.estado !== 'Cobrado').reduce((s, t) => s + t.valor, 0);

    return {
      turnosCount: turnosAnio.length,
      totalAnualGenerado,
      totalAnualCobrado,
      totalAnualPendiente,
      mesesResumen
    };
  }, [turnosValidos, anioReporte]);

  // Exportar a PDF
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('GATA — Reporte Financiero', 14, 18);
    doc.setFontSize(10);
    doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 25);

    if (tipoReporte === 'mes') {
      doc.text(`Periodo: ${getNombreMes(mesReporte)} ${anioReporte}`, 14, 32);
      doc.text(`Generado: ${formatearMoneda(datosPorMes.totalGenerado)} | Cobrado: ${formatearMoneda(datosPorMes.totalCobrado)} | Pendiente: ${formatearMoneda(datosPorMes.totalPendiente)}`, 14, 38);

      const tableRows = datosPorMes.porCliente.map(c => [
        c.cliente.nombre,
        c.turnosCount.toString(),
        c.diasTrabajados.toString(),
        formatearMoneda(c.generado),
        formatearMoneda(c.cobrado),
        formatearMoneda(c.pendiente)
      ]);

      autoTable(doc, {
        startY: 44,
        head: [['Cliente', 'Turnos', 'Días', 'Generado', 'Cobrado', 'Pendiente']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [22, 163, 74] }
      });
    } else if (tipoReporte === 'dia') {
      doc.text(`Fecha: ${formatearFechaCompleta(fechaDia)}`, 14, 32);
      doc.text(`Total del día: ${formatearMoneda(datosPorDia.total)}`, 14, 38);

      const tableRows = datosPorDia.turnos.map(t => [
        t.clienteNombre,
        t.diaSemana,
        formatearMoneda(t.valor),
        t.estado,
        t.observaciones || 'Sin observaciones'
      ]);

      autoTable(doc, {
        startY: 44,
        head: [['Cliente', 'Día', 'Valor', 'Estado', 'Observaciones']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] }
      });
    } else if (tipoReporte === 'anio') {
      doc.text(`Año: ${anioReporte}`, 14, 32);
      doc.text(`Total Anual Generado: ${formatearMoneda(datosPorAnio.totalAnualGenerado)}`, 14, 38);

      const tableRows = datosPorAnio.mesesResumen.map(m => [
        m.mes,
        m.turnosCount.toString(),
        m.diasTrabajados.toString(),
        formatearMoneda(m.generado),
        formatearMoneda(m.cobrado),
        formatearMoneda(m.pendiente)
      ]);

      autoTable(doc, {
        startY: 44,
        head: [['Mes', 'Turnos', 'Días', 'Generado', 'Cobrado', 'Pendiente']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [217, 119, 6] }
      });
    } else {
      // Cliente
      doc.text(`Reporte de Cliente: ${datosPorCliente.cliente?.nombre || 'Todos'}`, 14, 32);
      doc.text(`Generado: ${formatearMoneda(datosPorCliente.totalGenerado)} | Cobrado: ${formatearMoneda(datosPorCliente.totalCobrado)}`, 14, 38);

      const tableRows = datosPorCliente.turnos.map(t => [
        t.clienteNombre,
        formatearFechaCorta(t.fecha),
        t.diaSemana,
        formatearMoneda(t.valor),
        t.estado,
        t.observaciones || 'Sin observaciones'
      ]);

      autoTable(doc, {
        startY: 44,
        head: [['Cliente', 'Fecha', 'Día', 'Valor', 'Estado', 'Observación']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] }
      });
    }

    doc.save(`GATA-Reporte-${tipoReporte}-${Date.now()}.pdf`);
  };

  // Compartir por WhatsApp / Texto
  const compartirResumenWhatsApp = () => {
    let mensaje = `📊 *RESUMEN GATA* %0A`;
    if (tipoReporte === 'mes') {
      mensaje += `*Periodo:* ${getNombreMes(mesReporte)} ${anioReporte}%0A`;
      mensaje += `*Turnos:* ${datosPorMes.turnosCount}%0A`;
      mensaje += `*Generado:* ${formatearMoneda(datosPorMes.totalGenerado)}%0A`;
      mensaje += `*Cobrado:* ${formatearMoneda(datosPorMes.totalCobrado)}%0A`;
      mensaje += `*Por Cobrar:* ${formatearMoneda(datosPorMes.totalPendiente)}%0A`;
    } else if (tipoReporte === 'dia') {
      mensaje += `*Día:* ${formatearFechaCorta(fechaDia)}%0A`;
      mensaje += `*Total generado:* ${formatearMoneda(datosPorDia.total)}%0A`;
      mensaje += `*Turnos:* ${datosPorDia.turnos.length}%0A`;
    } else if (tipoReporte === 'cliente') {
      mensaje += `*Cliente:* ${datosPorCliente.cliente?.nombre || 'Todos'}%0A`;
      mensaje += `*Generado:* ${formatearMoneda(datosPorCliente.totalGenerado)}%0A`;
      mensaje += `*Pendiente:* ${formatearMoneda(datosPorCliente.totalPendiente)}%0A`;
    }

    window.open(`https://wa.me/?text=${mensaje}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Header Reportes */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-600/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold text-blue-100 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4" />
            Informes y Auditoría
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            📊 REPORTES FINANCIEROS
          </h2>
          <p className="text-xs text-blue-100 font-medium">
            Métricas desglosadas por día, mes, cliente y año con exportación
          </p>
        </div>

        {/* Acciones de exportar */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportarPDF}
            className="flex items-center gap-1.5 bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs px-3.5 py-2 rounded-xl shadow-md transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Descargar PDF
          </button>
          <button
            onClick={compartirResumenWhatsApp}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-md transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            WhatsApp
          </button>
        </div>
      </div>

      {/* Selector de Tipo de Reporte (Sección 25 del PDF) */}
      <div className="flex bg-slate-200/70 p-1 rounded-2xl gap-1 text-xs font-bold">
        {[
          { id: 'dia', label: 'POR DÍA' },
          { id: 'mes', label: 'POR MES' },
          { id: 'cliente', label: 'POR CLIENTE' },
          { id: 'anio', label: 'POR AÑO' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTipoReporte(t.id as any)}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              tipoReporte === t.id
                ? 'bg-white text-blue-800 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* FILTROS SEGÚN REPORTE SELECCIONADO */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          Filtro:
        </span>

        {tipoReporte === 'dia' && (
          <input
            type="date"
            value={fechaDia}
            onChange={(e) => setFechaDia(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
          />
        )}

        {(tipoReporte === 'mes' || tipoReporte === 'anio') && (
          <>
            {tipoReporte === 'mes' && (
              <select
                value={mesReporte}
                onChange={(e) => setMesReporte(Number(e.target.value))}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
              >
                {LISTA_MESES.map(m => (
                  <option key={m.numero} value={m.numero}>{m.nombre}</option>
                ))}
              </select>
            )}

            <select
              value={anioReporte}
              onChange={(e) => setAnioReporte(Number(e.target.value))}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
            >
              {[2024, 2025, 2026, 2027, 2028].map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </>
        )}

        {tipoReporte === 'cliente' && (
          <select
            value={clienteReporteId}
            onChange={(e) => setClienteReporteId(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
          >
            <option value="todos">Todos los Clientes</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        )}
      </div>

      {/* CONTENIDO 1: REPORTE POR DÍA */}
      {tipoReporte === 'dia' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">{formatearFechaCompleta(fechaDia)}</h3>
              <span className="text-xs text-slate-500">{datosPorDia.turnos.length} turnos realizados</span>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-right">
              <span className="text-[10px] font-bold text-blue-700 uppercase block">Total del Día</span>
              <span className="text-xl font-black text-blue-900">{formatearMoneda(datosPorDia.total)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {datosPorDia.turnos.map(t => (
              <div key={t.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-slate-800">{t.clienteNombre}</span>
                  <span className="font-black text-slate-900">{formatearMoneda(t.valor)}</span>
                </div>
                <div className="text-xs text-slate-500 italic">
                  {t.observaciones ? `"${t.observaciones}"` : 'Sin observaciones'}
                </div>
                <div className="text-right">
                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    t.estado === 'Cobrado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {t.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTENIDO 2: REPORTE POR MES */}
      {tipoReporte === 'mes' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Resumen de {getNombreMes(mesReporte)} {anioReporte}
              </h3>
              <span className="text-xs text-slate-500">{datosPorMes.diasTrabajados} días trabajados en el mes</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Turnos</span>
              <span className="text-xl font-black text-slate-800">{datosPorMes.turnosCount}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Generado</span>
              <span className="text-lg font-black text-slate-900">{formatearMoneda(datosPorMes.totalGenerado)}</span>
            </div>
            <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
              <span className="text-[10px] text-emerald-600 font-bold block uppercase">Cobrado</span>
              <span className="text-lg font-black text-emerald-700">{formatearMoneda(datosPorMes.totalCobrado)}</span>
            </div>
            <div className="bg-rose-50 p-3 rounded-2xl border border-rose-100">
              <span className="text-[10px] text-rose-600 font-bold block uppercase">Pendiente</span>
              <span className="text-lg font-black text-rose-600">{formatearMoneda(datosPorMes.totalPendiente)}</span>
            </div>
          </div>

          {/* Tabla clientes */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase">
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3">Turnos</th>
                  <th className="py-2.5 px-3">Días</th>
                  <th className="py-2.5 px-3">Generado</th>
                  <th className="py-2.5 px-3">Cobrado</th>
                  <th className="py-2.5 px-3">Pendiente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {datosPorMes.porCliente.map(item => (
                  <tr key={item.cliente.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-800">{item.cliente.nombre}</td>
                    <td className="py-3 px-3">{item.turnosCount}</td>
                    <td className="py-3 px-3">{item.diasTrabajados}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{formatearMoneda(item.generado)}</td>
                    <td className="py-3 px-3 font-bold text-emerald-700">{formatearMoneda(item.cobrado)}</td>
                    <td className="py-3 px-3 font-bold text-rose-600">{formatearMoneda(item.pendiente)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTENIDO 3: REPORTE POR CLIENTE */}
      {tipoReporte === 'cliente' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Turnos</span>
              <span className="text-xl font-black text-slate-800">{datosPorCliente.turnosCount}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Días</span>
              <span className="text-xl font-black text-slate-800">{datosPorCliente.diasTrabajados}</span>
            </div>
            <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
              <span className="text-[10px] text-emerald-600 font-bold block uppercase">Cobrado</span>
              <span className="text-lg font-black text-emerald-700">{formatearMoneda(datosPorCliente.totalCobrado)}</span>
            </div>
            <div className="bg-rose-50 p-3 rounded-2xl border border-rose-100">
              <span className="text-[10px] text-rose-600 font-bold block uppercase">Pendiente</span>
              <span className="text-lg font-black text-rose-600">{formatearMoneda(datosPorCliente.totalPendiente)}</span>
            </div>
          </div>

          <div className="space-y-2">
            {datosPorCliente.turnos.map(t => (
              <div key={t.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between text-xs items-center">
                <div>
                  <span className="font-bold text-slate-800">{formatearFechaCorta(t.fecha)} ({t.diaSemana})</span>
                  {t.observaciones && <span className="italic text-slate-500 ml-2">"{t.observaciones}"</span>}
                </div>
                <div className="flex items-center gap-3">
                  <strong className="text-slate-900">{formatearMoneda(t.valor)}</strong>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                    t.estado === 'Cobrado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {t.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTENIDO 4: REPORTE POR AÑO */}
      {tipoReporte === 'anio' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Total Anual {anioReporte}</h3>
              <span className="text-xs text-slate-500">{datosPorAnio.turnosCount} turnos en todo el año</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Generado en el Año</span>
              <span className="text-2xl font-black text-blue-900">{formatearMoneda(datosPorAnio.totalAnualGenerado)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {datosPorAnio.mesesResumen.map(m => (
              <div key={m.numero} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs">
                <div className="flex justify-between items-center font-black text-slate-800">
                  <span>{m.mes}</span>
                  <span className="text-blue-700">{m.turnosCount} turnos</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Generado:</span>
                  <strong className="text-slate-900">{formatearMoneda(m.generado)}</strong>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Cobrado:</span>
                  <strong>{formatearMoneda(m.cobrado)}</strong>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>Pendiente:</span>
                  <strong>{formatearMoneda(m.pendiente)}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
