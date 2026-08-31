import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CierreMensual, CierreDetalleCliente } from '../types';
import { formatearMoneda } from '../utils/formatters';
import { getNombreMes, LISTA_MESES, formatearFechaCorta, formatearFechaCompleta } from '../utils/dateUtils';
import { 
  FolderLock, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Clock, 
  BookmarkCheck, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Download, 
  Trash2,
  Layers
} from 'lucide-react';

export const CierresView: React.FC = () => {
  const { clientes, turnos, cierres, guardarCierre, eliminarCierre } = useApp();

  const [mesSeleccionado, setMesSeleccionado] = useState<number>(() => new Date().getMonth() + 1);
  const [anioSeleccionado, setAnioSeleccionado] = useState<number>(() => new Date().getFullYear());
  const [tabActual, setTabActual] = useState<'generar' | 'historicos'>('generar');
  const [clienteExpandidoId, setClienteExpandidoId] = useState<string | null>(null);
  const [cierreHistoricoVer, setCierreHistoricoVer] = useState<CierreMensual | null>(null);

  // Generar datos dinámicos del periodo seleccionado (Sección 22 & 23 del PDF)
  const datosPeriodo = useMemo(() => {
    // Filtrar turnos de este mes/año no anulados
    const turnosPeriodo = turnos.filter(t => {
      if (t.estado === 'Anulado') return false;
      const [tAnio, tMes] = t.fecha.split('-').map(Number);
      return tAnio === anioSeleccionado && tMes === mesSeleccionado;
    });

    // Agrupar por cliente
    const clientesDetalle: CierreDetalleCliente[] = [];
    const clientesIdsUnicos = Array.from(new Set(turnosPeriodo.map(t => t.clienteId)));

    let totalTurnos = 0;
    let totalGenerado = 0;
    let totalCobrado = 0;
    let totalPendiente = 0;
    const fechasGlobalesUnicas = new Set<string>();

    clientesIdsUnicos.forEach(cId => {
      const turnosCli = turnosPeriodo.filter(t => t.clienteId === cId).sort((a, b) => a.fecha.localeCompare(b.fecha));
      const cli = clientes.find(c => c.id === cId);
      const nombreCli = cli ? cli.nombre : (turnosCli[0]?.clienteNombre || 'Cliente');

      const fechasCliUnicas = new Set(turnosCli.map(t => t.fecha));
      turnosCli.forEach(t => fechasGlobalesUnicas.add(t.fecha));

      let gen = 0;
      let cob = 0;
      let pen = 0;

      turnosCli.forEach(t => {
        gen += t.valor;
        if (t.estado === 'Cobrado') {
          cob += t.valor;
        } else {
          pen += t.valor;
        }
      });

      totalTurnos += turnosCli.length;
      totalGenerado += gen;
      totalCobrado += cob;
      totalPendiente += pen;

      clientesDetalle.push({
        clienteId: cId,
        clienteNombre: nombreCli,
        cantidadTurnos: turnosCli.length,
        diasTrabajados: fechasCliUnicas.size,
        generado: gen,
        cobrado: cob,
        pendiente: pen,
        turnos: turnosCli.map(t => ({
          id: t.id,
          fecha: t.fecha,
          diaSemana: t.diaSemana,
          valor: t.valor,
          estado: t.estado,
          observacion: t.observaciones
        }))
      });
    });

    return {
      clientesDetalle,
      totalTurnos,
      totalDiasTrabajados: fechasGlobalesUnicas.size,
      totalGenerado,
      totalCobrado,
      totalPendiente
    };
  }, [turnos, clientes, mesSeleccionado, anioSeleccionado]);

  const handleGuardarCierreOficial = () => {
    const nuevoCierre: CierreMensual = {
      id: `cie-${anioSeleccionado}-${mesSeleccionado}-${Date.now()}`,
      mes: mesSeleccionado,
      anio: anioSeleccionado,
      fechaCierre: new Date().toISOString(),
      clientes: datosPeriodo.clientesDetalle,
      totalTurnos: datosPeriodo.totalTurnos,
      totalDiasTrabajados: datosPeriodo.totalDiasTrabajados,
      totalGenerado: datosPeriodo.totalGenerado,
      totalCobrado: datosPeriodo.totalCobrado,
      totalPendiente: datosPeriodo.totalPendiente
    };

    guardarCierre(nuevoCierre);
    setTabActual('historicos');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Header Cierres */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-6 text-white shadow-xl shadow-amber-600/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold text-amber-100 uppercase tracking-wider flex items-center gap-1.5">
            <FolderLock className="w-4 h-4" />
            Consolidado Contable
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            📁 CIERRES MENSUALES
          </h2>
          <p className="text-xs text-amber-100 font-medium">
            Resumen de turnos, días trabajados y estados de cobro por mes
          </p>
        </div>

        {/* Tabs Generar vs Históricos */}
        <div className="flex bg-white/20 backdrop-blur-md p-1 rounded-2xl gap-1 text-xs font-bold">
          <button
            onClick={() => setTabActual('generar')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              tabActual === 'generar'
                ? 'bg-white text-amber-900 shadow-md font-black'
                : 'text-white/80 hover:text-white'
            }`}
          >
            📊 Cierre Actual
          </button>
          <button
            onClick={() => setTabActual('historicos')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              tabActual === 'historicos'
                ? 'bg-white text-amber-900 shadow-md font-black'
                : 'text-white/80 hover:text-white'
            }`}
          >
            📚 Cierres Guardados ({cierres.length})
          </button>
        </div>
      </div>

      {/* VISTA 1: GENERAR / REVISAR CIERRE ACTUAL */}
      {tabActual === 'generar' && (
        <div className="space-y-6">
          
          {/* Selector de Mes y Año (Sección 22 del PDF) */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Periodo:
              </span>
              <select
                value={mesSeleccionado}
                onChange={(e) => setMesSeleccionado(Number(e.target.value))}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-amber-500"
              >
                {LISTA_MESES.map(m => (
                  <option key={m.numero} value={m.numero}>{m.nombre}</option>
                ))}
              </select>

              <select
                value={anioSeleccionado}
                onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-amber-500"
              >
                {[2024, 2025, 2026, 2027, 2028].map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGuardarCierreOficial}
              disabled={datosPeriodo.totalTurnos === 0}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 active:scale-95 disabled:opacity-40 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md shadow-amber-600/20 transition-all cursor-pointer"
            >
              <BookmarkCheck className="w-4 h-4 stroke-[2.5]" />
              Guardar Cierre Oficial del Mes
            </button>
          </div>

          {/* Resumen Total del Cierre (Sección 22 del PDF) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 uppercase">
                TOTAL {getNombreMes(mesSeleccionado)} {anioSeleccionado}
              </h3>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                {datosPeriodo.clientesDetalle.length} cliente(s) activos
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Turnos</span>
                <span className="text-xl font-black text-slate-800">{datosPeriodo.totalTurnos}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Días Trabajados</span>
                <span className="text-xl font-black text-slate-800">{datosPeriodo.totalDiasTrabajados}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Generado</span>
                <span className="text-lg font-black text-slate-900">{formatearMoneda(datosPeriodo.totalGenerado)}</span>
              </div>
              <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Cobrado</span>
                <span className="text-lg font-black text-emerald-700">{formatearMoneda(datosPeriodo.totalCobrado)}</span>
              </div>
              <div className="col-span-2 sm:col-span-1 bg-rose-50 p-3.5 rounded-2xl border border-rose-100">
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">Pendiente</span>
                <span className="text-lg font-black text-rose-600">{formatearMoneda(datosPeriodo.totalPendiente)}</span>
              </div>
            </div>
          </div>

          {/* Desglose por Cliente con Fechas y Observaciones (Sección 23 del PDF) */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">
              Desglose Detallado por Cliente
            </h3>

            {datosPeriodo.clientesDetalle.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-xs">
                No se registraron turnos en {getNombreMes(mesSeleccionado)} de {anioSeleccionado}.
              </div>
            ) : (
              <div className="space-y-3">
                {datosPeriodo.clientesDetalle.map(cli => {
                  const isExpanded = clienteExpandidoId === cli.clienteId;

                  return (
                    <div
                      key={cli.clienteId}
                      className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden transition-all"
                    >
                      {/* Header Cliente */}
                      <div
                        onClick={() => setClienteExpandidoId(isExpanded ? null : cli.clienteId)}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/80"
                      >
                        <div>
                          <h4 className="font-extrabold text-base text-slate-900">{cli.clienteNombre}</h4>
                          <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
                            <span>{cli.cantidadTurnos} turnos</span>
                            <span>•</span>
                            <span>{cli.diasTrabajados} días trabajados</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <div className="text-right">
                            <div className="text-sm font-black text-slate-900">{formatearMoneda(cli.generado)}</div>
                            <div className="text-[11px] font-semibold text-emerald-600">
                              Cobrado: {formatearMoneda(cli.cobrado)}
                            </div>
                            {cli.pendiente > 0 && (
                              <div className="text-[11px] font-bold text-rose-600">
                                Pendiente: {formatearMoneda(cli.pendiente)}
                              </div>
                            )}
                          </div>

                          <div className="p-2 rounded-xl bg-slate-100 text-slate-500">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                      </div>

                      {/* 23. FECHAS EN EL CIERRE (Expandible) */}
                      {isExpanded && (
                        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 space-y-3 animate-in fade-in">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                            📅 Fechas del turno y observaciones ({cli.turnos.length})
                          </span>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {cli.turnos.map(t => (
                              <div
                                key={t.id}
                                className="p-3 bg-white rounded-2xl border border-slate-200 text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-800">
                                    {formatearFechaCorta(t.fecha)} — <strong className="text-amber-800">{t.diaSemana}</strong>
                                  </span>
                                  <span className="font-black text-slate-900">{formatearMoneda(t.valor)}</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="italic text-slate-500 truncate max-w-[200px]">
                                    {t.observacion ? `"${t.observacion}"` : 'Sin observaciones'}
                                  </span>
                                  <span className={`font-extrabold uppercase px-1.5 py-0.2 rounded-full text-[9px] ${
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VISTA 2: 24. CIERRES HISTÓRICOS */}
      {tabActual === 'historicos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base">
              Cierres Oficiales Guardados
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Información histórica inmutable
            </span>
          </div>

          {cierres.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-2">
              <FolderLock className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-sm font-bold text-slate-700">No hay cierres guardados aún</div>
              <p className="text-xs text-slate-400">
                Selecciona un mes en "Cierre Actual" y presiona "Guardar Cierre Oficial del Mes".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cierres.map(cie => (
                <div
                  key={cie.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-lg text-slate-900">
                        {getNombreMes(cie.mes)} {cie.anio}
                      </h4>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Guardado {formatearFechaCorta(cie.fechaCierre.split('T')[0])}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs text-center py-2 bg-slate-50 rounded-2xl">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Turnos</span>
                        <strong className="text-slate-800 text-sm">{cie.totalTurnos}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-600 font-bold block uppercase">Cobrado</span>
                        <strong className="text-emerald-700 text-sm">{formatearMoneda(cie.totalCobrado)}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-rose-600 font-bold block uppercase">Pendiente</span>
                        <strong className="text-rose-600 text-sm">{formatearMoneda(cie.totalPendiente)}</strong>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600">
                      <strong>Clientes incluidos:</strong> {cie.clientes.map(c => c.clienteNombre).join(', ')}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <button
                      onClick={() => setCierreHistoricoVer(cie)}
                      className="text-xs text-amber-700 font-bold hover:underline cursor-pointer"
                    >
                      Ver detalle completo
                    </button>
                    <button
                      onClick={() => eliminarCierre(cie.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Eliminar registro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de Detalle Cierre Histórico */}
      {cierreHistoricoVer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="bg-amber-600 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg">
                  Cierre Histórico: {getNombreMes(cierreHistoricoVer.mes)} {cierreHistoricoVer.anio}
                </h3>
                <p className="text-xs text-amber-100">
                  Total generado: {formatearMoneda(cierreHistoricoVer.totalGenerado)}
                </p>
              </div>
              <button
                onClick={() => setCierreHistoricoVer(null)}
                className="p-2 rounded-full hover:bg-white/20 text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              {cierreHistoricoVer.clientes.map(cli => (
                <div key={cli.clienteId} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <h5 className="font-bold text-sm text-slate-900">{cli.clienteNombre}</h5>
                    <span className="font-black text-slate-800 text-sm">{formatearMoneda(cli.generado)}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {cli.cantidadTurnos} turnos • {cli.diasTrabajados} días trabajados • Cobrado: {formatearMoneda(cli.cobrado)}
                  </div>
                  <div className="space-y-1 pt-1">
                    {cli.turnos.map(t => (
                      <div key={t.id} className="text-xs bg-white p-2 rounded-xl border border-slate-100 flex justify-between">
                        <span>{formatearFechaCorta(t.fecha)} ({t.diaSemana}) - {t.observacion || 'Sin observación'}</span>
                        <strong className="text-slate-800">{formatearMoneda(t.valor)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setCierreHistoricoVer(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
