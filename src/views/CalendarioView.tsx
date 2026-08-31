import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Turno } from '../types';
import { 
  getHoyFechaStr, 
  getDiaSemana, 
  formatearFechaCompleta, 
  formatearFechaCorta, 
  getNombreMes, 
  LISTA_MESES 
} from '../utils/dateUtils';
import { formatearMoneda } from '../utils/formatters';
import { getClienteColor } from '../utils/clientColors';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  DollarSign, 
  FileText, 
  Plus, 
  Edit,
  Tag
} from 'lucide-react';
import { ModalEditarTurno } from '../components/ModalEditarTurno';

interface CalendarioViewProps {
  onOpenAgregarTurno: () => void;
}

export const CalendarioView: React.FC<CalendarioViewProps> = ({ onOpenAgregarTurno }) => {
  const { turnos, clientes } = useApp();

  const [tipoVista, setTipoVista] = useState<'mensual' | 'semanal' | 'diaria'>('mensual');
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(getHoyFechaStr());
  
  // Mes y Año del visor mensual
  const [mesActual, setMesActual] = useState<number>(() => new Date().getMonth() + 1);
  const [anioActual, setAnioActual] = useState<number>(() => new Date().getFullYear());

  const [turnoAEditar, setTurnoAEditar] = useState<Turno | null>(null);

  // Turnos no anulados
  const turnosValidos = useMemo(() => {
    return turnos.filter(t => t.estado !== 'Anulado');
  }, [turnos]);

  // Mapa de turnos por fecha YYYY-MM-DD
  const turnosPorFecha = useMemo(() => {
    const mapa = new Map<string, Turno[]>();
    turnosValidos.forEach(t => {
      const lista = mapa.get(t.fecha) || [];
      lista.push(t);
      mapa.set(t.fecha, lista);
    });
    return mapa;
  }, [turnosValidos]);

  // Turnos del día seleccionado
  const turnosDelDia = turnosPorFecha.get(fechaSeleccionada) || [];
  const totalGeneradoDia = turnosDelDia.reduce((sum, t) => sum + t.valor, 0);

  // Navegación mensual
  const navegarMes = (direccion: 'ant' | 'sig') => {
    if (direccion === 'ant') {
      if (mesActual === 1) {
        setMesActual(12);
        setAnioActual(prev => prev - 1);
      } else {
        setMesActual(prev => prev - 1);
      }
    } else {
      if (mesActual === 12) {
        setMesActual(1);
        setAnioActual(prev => prev + 1);
      } else {
        setMesActual(prev => prev + 1);
      }
    }
  };

  // Generación de la grilla mensual
  const diasGrillaMensual = useMemo(() => {
    const primerDiaMes = new Date(anioActual, mesActual - 1, 1);
    const ultimoDiaMes = new Date(anioActual, mesActual, 0);
    const diasEnMes = ultimoDiaMes.getDate();
    
    // Día de inicio (0 = Domingo, 1 = Lunes, etc.)
    const diaInicio = primerDiaMes.getDay();

    const dias = [];

    // Rellenos del mes anterior
    const ultimoDiaMesAnterior = new Date(anioActual, mesActual - 1, 0).getDate();
    for (let i = diaInicio - 1; i >= 0; i--) {
      const numDia = ultimoDiaMesAnterior - i;
      const mesAnt = mesActual === 1 ? 12 : mesActual - 1;
      const anioAnt = mesActual === 1 ? anioActual - 1 : anioActual;
      const fechaStr = `${anioAnt}-${String(mesAnt).padStart(2, '0')}-${String(numDia).padStart(2, '0')}`;
      dias.push({ fechaStr, numDia, esMesActual: false });
    }

    // Días del mes actual
    for (let d = 1; d <= diasEnMes; d++) {
      const fechaStr = `${anioActual}-${String(mesActual).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      dias.push({ fechaStr, numDia: d, esMesActual: true });
    }

    // Rellenos del mes siguiente para completar múltiplos de 7
    const diasRestantes = 42 - dias.length;
    for (let s = 1; s <= diasRestantes && dias.length < 42; s++) {
      const mesSig = mesActual === 12 ? 1 : mesActual + 1;
      const anioSig = mesActual === 12 ? anioActual + 1 : anioActual;
      const fechaStr = `${anioSig}-${String(mesSig).padStart(2, '0')}-${String(s).padStart(2, '0')}`;
      dias.push({ fechaStr, numDia: s, esMesActual: false });
    }

    return dias;
  }, [mesActual, anioActual]);

  // Generación de la vista semanal (7 días alrededor de la fecha seleccionada)
  const diasSemanal = useMemo(() => {
    const [anio, mes, dia] = fechaSeleccionada.split('-').map(Number);
    const fechaObj = new Date(anio, mes - 1, dia);
    const diaSemana = fechaObj.getDay(); // 0 Dom, 1 Lun, etc.
    
    // Inicio semana (Lunes)
    const fechaInicio = new Date(fechaObj);
    fechaInicio.setDate(fechaObj.getDate() - ((diaSemana + 6) % 7));

    const dias = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(fechaInicio);
      d.setDate(fechaInicio.getDate() + i);
      const dAnio = d.getFullYear();
      const dMes = String(d.getMonth() + 1).padStart(2, '0');
      const dDia = String(d.getDate()).padStart(2, '0');
      const fechaStr = `${dAnio}-${dMes}-${dDia}`;
      dias.push({ fechaStr, numDia: d.getDate(), diaSem: getDiaSemana(fechaStr) });
    }
    return dias;
  }, [fechaSeleccionada]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Header Calendario y Selector de Vista */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-brand-600" />
            Calendario Visual de Turnos
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Identificación visual por cliente con colores diferenciados
          </p>
        </div>

        {/* Tabs de vista: Mensual / Semanal / Diaria */}
        <div className="flex bg-slate-200/70 p-1 rounded-2xl gap-1 text-xs font-bold self-start sm:self-auto">
          {(['mensual', 'semanal', 'diaria'] as const).map(tipo => (
            <button
              key={tipo}
              onClick={() => setTipoVista(tipo)}
              className={`py-1.5 px-3 rounded-xl transition-all capitalize cursor-pointer ${
                tipoVista === tipo
                  ? 'bg-white text-brand-700 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vista {tipo}
            </button>
          ))}
        </div>
      </div>

      {/* LEYENDA DE COLORES POR CLIENTE */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <Tag className="w-3.5 h-3.5 text-brand-600" />
          <span>Colores de Clientes:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {clientes.map(cli => {
            const paleta = getClienteColor(cli.id, cli.nombre);
            return (
              <div
                key={cli.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border shadow-2xs"
                style={{
                  backgroundColor: `${paleta.dot}15`,
                  borderColor: `${paleta.dot}40`,
                  color: paleta.dot
                }}
              >
                <span 
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" 
                  style={{ backgroundColor: paleta.dot }} 
                />
                <span className="truncate max-w-[140px] text-slate-800 font-extrabold">{cli.nombre}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* VISTA 1: MENSUAL                                         */}
      {/* ======================================================== */}
      {tipoVista === 'mensual' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          
          {/* Barra de Navegación de Mes */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900">
                {getNombreMes(mesActual)} {anioActual}
              </h3>
              <button
                onClick={() => {
                  const hoy = new Date();
                  setMesActual(hoy.getMonth() + 1);
                  setAnioActual(hoy.getFullYear());
                  setFechaSeleccionada(getHoyFechaStr());
                }}
                className="text-[11px] font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg border border-brand-200 transition-colors cursor-pointer"
              >
                Hoy
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => navegarMes('ant')}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => navegarMes('sig')}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Encabezados Días de la semana */}
          <div className="grid grid-cols-7 text-center text-[11px] font-extrabold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
            <span>Dom</span>
            <span>Lun</span>
            <span>Mar</span>
            <span>Mié</span>
            <span>Jue</span>
            <span>Vie</span>
            <span>Sáb</span>
          </div>

          {/* Días del Mes */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {diasGrillaMensual.map((dia, idx) => {
              const turnosDia = turnosPorFecha.get(dia.fechaStr) || [];
              const tieneTurnos = turnosDia.length > 0;
              const isSelected = fechaSeleccionada === dia.fechaStr;
              const totalDia = turnosDia.reduce((s, t) => s + t.valor, 0);

              return (
                <div
                  key={idx}
                  onClick={() => setFechaSeleccionada(dia.fechaStr)}
                  className={`min-h-[70px] sm:min-h-[92px] p-1.5 sm:p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-50/70 border-brand-500 ring-2 ring-brand-500/20 shadow-xs'
                      : dia.esMesActual
                      ? tieneTurnos
                        ? 'bg-white border-slate-200 hover:border-brand-300'
                        : 'bg-white/50 border-slate-100 hover:bg-slate-50'
                      : 'bg-slate-50/50 border-transparent text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${
                      dia.esMesActual ? 'text-slate-800' : 'text-slate-400'
                    }`}>
                      {dia.numDia}
                    </span>

                    {/* Puntos de colores por cliente en este día */}
                    {tieneTurnos && (
                      <div className="flex items-center gap-0.5">
                        {turnosDia.map(t => {
                          const paleta = getClienteColor(t.clienteId, t.clienteNombre);
                          return (
                            <span 
                              key={t.id} 
                              className="w-2 h-2 rounded-full ring-1 ring-white" 
                              style={{ backgroundColor: paleta.dot }}
                              title={`${t.clienteNombre}: ${formatearMoneda(t.valor)}`}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {tieneTurnos && (
                    <div className="space-y-1 mt-1">
                      {/* Mini pills de clientes con su color específico */}
                      <div className="space-y-0.5 hidden sm:block">
                        {turnosDia.slice(0, 2).map(t => {
                          const paleta = getClienteColor(t.clienteId, t.clienteNombre);
                          return (
                            <div
                              key={t.id}
                              className="text-[9px] px-1 py-0.2 rounded-md font-bold truncate flex items-center gap-1"
                              style={{
                                backgroundColor: `${paleta.dot}20`,
                                color: paleta.dot
                              }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: paleta.dot }} />
                              <span className="truncate text-slate-800 font-extrabold">{t.clienteNombre.split(' ')[0]}</span>
                            </div>
                          );
                        })}
                        {turnosDia.length > 2 && (
                          <div className="text-[8px] font-bold text-slate-400 text-right">
                            +{turnosDia.length - 2} más
                          </div>
                        )}
                      </div>

                      <div className="text-[10px] sm:text-xs font-black text-slate-900 truncate">
                        {formatearMoneda(totalDia)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VISTA 2: SEMANAL                                         */}
      {/* ======================================================== */}
      {tipoVista === 'semanal' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Vista Semanal
            </h3>
            <span className="text-xs text-slate-500">
              Semana de {formatearFechaCorta(diasSemanal[0].fechaStr)} a {formatearFechaCorta(diasSemanal[6].fechaStr)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
            {diasSemanal.map(dia => {
              const turnosDia = turnosPorFecha.get(dia.fechaStr) || [];
              const isSelected = fechaSeleccionada === dia.fechaStr;
              const totalDia = turnosDia.reduce((s, t) => s + t.valor, 0);

              return (
                <div
                  key={dia.fechaStr}
                  onClick={() => setFechaSeleccionada(dia.fechaStr)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-amber-50/80 border-brand-500 ring-2 ring-brand-500/20'
                      : 'bg-white border-slate-200 hover:border-brand-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{dia.diaSem}</span>
                    <span className="text-xs text-slate-500 font-semibold">{dia.numDia}</span>
                  </div>

                  {turnosDia.length > 0 ? (
                    <div className="space-y-1">
                      {turnosDia.map(t => {
                        const paleta = getClienteColor(t.clienteId, t.clienteNombre);
                        return (
                          <div 
                            key={t.id} 
                            className="text-[10px] px-1.5 py-0.5 rounded-lg font-bold truncate flex items-center gap-1"
                            style={{
                              backgroundColor: `${paleta.dot}18`,
                              color: paleta.dot
                            }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: paleta.dot }} />
                            <span className="text-slate-900 font-extrabold truncate">{t.clienteNombre}</span>
                          </div>
                        );
                      })}
                      <div className="text-xs font-black text-slate-900 pt-0.5">{formatearMoneda(totalDia)}</div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-300">Sin turnos</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DETALLE DEL DÍA SELECCIONADO (Con tarjetas coloreadas)   */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Día Seleccionado
            </span>
            <h3 className="text-lg font-black text-slate-900">
              {formatearFechaCompleta(fechaSeleccionada)}
            </h3>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 sm:text-right">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              Total Generado del Día
            </span>
            <span className="text-xl font-black text-emerald-700">
              {formatearMoneda(totalGeneradoDia)}
            </span>
          </div>
        </div>

        {/* Turnos en este día */}
        {turnosDelDia.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <Clock className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-xs font-bold text-slate-600">No hay turnos registrados en esta fecha.</div>
            <button
              onClick={onOpenAgregarTurno}
              className="text-xs text-brand-600 font-bold hover:underline cursor-pointer inline-block"
            >
              + Agregar un turno para este día
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Turnos Realizados ({turnosDelDia.length})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {turnosDelDia.map(t => {
                const paleta = getClienteColor(t.clienteId, t.clienteNombre);

                return (
                  <div
                    key={t.id}
                    onClick={() => setTurnoAEditar(t)}
                    className="p-4 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer space-y-3 shadow-2xs hover:shadow-xs relative overflow-hidden"
                    style={{
                      backgroundColor: `${paleta.dot}08`,
                      borderColor: `${paleta.dot}35`
                    }}
                  >
                    {/* Barra de acento lateral con el color del cliente */}
                    <div 
                      className="absolute top-0 left-0 bottom-0 w-1.5"
                      style={{ backgroundColor: paleta.dot }}
                    />

                    <div className="flex items-start justify-between gap-2 pl-2">
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-xs"
                          style={{ backgroundColor: paleta.dot }}
                        >
                          {t.clienteNombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h5 className="font-extrabold text-sm text-slate-900">{t.clienteNombre}</h5>
                          <div className="text-xs text-slate-500 font-medium">{t.diaSemana}</div>
                        </div>
                      </div>

                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        t.estado === 'Cobrado' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {t.estado}
                      </span>
                    </div>

                    {/* Observación del turno */}
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 text-xs ml-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                        Observación:
                      </span>
                      {t.observaciones ? (
                        <span className="text-slate-700 italic font-medium">"{t.observaciones}"</span>
                      ) : (
                        <span className="text-slate-400 italic">Sin observaciones</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs ml-2">
                      <span className="text-slate-500 font-medium">Valor del turno:</span>
                      <span className="font-black text-base text-slate-900">{formatearMoneda(t.valor)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <ModalEditarTurno
        isOpen={Boolean(turnoAEditar)}
        onClose={() => setTurnoAEditar(null)}
        turno={turnoAEditar}
      />
    </div>
  );
};
