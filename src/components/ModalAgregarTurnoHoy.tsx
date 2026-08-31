import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getHoyFechaStr, getDiaSemana, formatearFechaCompleta, formatearFechaCorta } from '../utils/dateUtils';
import { formatearMoneda } from '../utils/formatters';
import { Calendar, AlertTriangle, Plus, X, Check, User, DollarSign, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ModalAgregarTurnoHoyProps {
  isOpen: boolean;
  onClose: () => void;
  clientePreseleccionadoId?: string;
}

export const ModalAgregarTurnoHoy: React.FC<ModalAgregarTurnoHoyProps> = ({ 
  isOpen, 
  onClose,
  clientePreseleccionadoId
}) => {
  const { clientes, agregarTurno, verificarTurnoDuplicado } = useApp();

  const [fecha, setFecha] = useState<string>(getHoyFechaStr());
  const [clienteId, setClienteId] = useState<string>('');
  const [observaciones, setObservaciones] = useState<string>('');
  const [valorManual, setValorManual] = useState<string>('');
  const [usarValorPersonalizado, setUsarValorPersonalizado] = useState<boolean>(false);
  const [mostrarAlertaDuplicado, setMostrarAlertaDuplicado] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Clientes activos
  const clientesActivos = clientes.filter(c => c.estado === 'Activo');

  // Inicialización al abrir modal
  useEffect(() => {
    if (isOpen) {
      const hoy = getHoyFechaStr();
      setFecha(hoy);
      setObservaciones('');
      setMostrarAlertaDuplicado(false);
      setErrorMsg('');
      setUsarValorPersonalizado(false);

      if (clientePreseleccionadoId) {
        setClienteId(clientePreseleccionadoId);
        const cli = clientes.find(c => c.id === clientePreseleccionadoId);
        if (cli) setValorManual(cli.valorTurnoActual.toString());
      } else if (clientesActivos.length > 0) {
        setClienteId(clientesActivos[0].id);
        setValorManual(clientesActivos[0].valorTurnoActual.toString());
      } else {
        setClienteId('');
        setValorManual('');
      }
    }
  }, [isOpen, clientePreseleccionadoId, clientes]);

  if (!isOpen) return null;

  const clienteSeleccionado = clientes.find(c => c.id === clienteId);
  const diaSemana = getDiaSemana(fecha);
  const valorFinal = usarValorPersonalizado && valorManual 
    ? parseFloat(valorManual) 
    : (clienteSeleccionado?.valorTurnoActual || 0);

  const handleClienteChange = (nuevoId: string) => {
    setClienteId(nuevoId);
    setMostrarAlertaDuplicado(false);
    setErrorMsg('');
    const cli = clientes.find(c => c.id === nuevoId);
    if (cli && !usarValorPersonalizado) {
      setValorManual(cli.valorTurnoActual.toString());
    }
  };

  const handleGuardar = (forzarDuplicado: boolean = false) => {
    setErrorMsg('');
    if (!clienteId) {
      setErrorMsg('Debes seleccionar un cliente.');
      return;
    }
    if (!fecha) {
      setErrorMsg('Debes ingresar una fecha válida.');
      return;
    }

    // Validar duplicado
    const yaExiste = verificarTurnoDuplicado(clienteId, fecha);
    if (yaExiste && !forzarDuplicado) {
      setMostrarAlertaDuplicado(true);
      return;
    }

    // Agregar turno
    agregarTurno({
      clienteId,
      fecha,
      observaciones: observaciones.trim() || undefined,
      valorPersonalizado: usarValorPersonalizado ? valorFinal : undefined
    });

    // Celebración visual ligera
    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.85 }
      });
    } catch {
      // Ignorar si confetti falla
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-emerald-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-xs">
              <Plus className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Agregar Turno</h2>
              <p className="text-xs text-brand-100 font-medium">Registro rápido de jornada</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Fecha y Día de la Semana */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-brand-600" />
                Fecha del Turno
              </span>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-800 border border-brand-200">
                {diaSemana || 'Selecciona'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={fecha}
                onChange={(e) => {
                  setFecha(e.target.value);
                  setMostrarAlertaDuplicado(false);
                }}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="text-xs text-slate-600 font-medium">
              {formatearFechaCompleta(fecha)}
            </div>
          </div>

          {/* Selector de Cliente */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-brand-600" />
              Cliente *
            </label>
            {clientesActivos.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                No tienes clientes activos registrados. Crea un cliente primero.
              </div>
            ) : (
              <select
                value={clienteId}
                onChange={(e) => handleClienteChange(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
              >
                {clientesActivos.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({formatearMoneda(c.valorTurnoActual)} por turno)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Tarjeta de Valor del Turno */}
          {clienteSeleccionado && (
            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  Valor del Turno
                </span>
                <div className="text-xl font-black text-emerald-700 mt-0.5">
                  {formatearMoneda(valorFinal)}
                </div>
                <div className="text-[11px] text-emerald-600">
                  Tarifa configurada para {clienteSeleccionado.nombre}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setUsarValorPersonalizado(!usarValorPersonalizado)}
                className="text-xs text-emerald-700 font-semibold underline hover:text-emerald-900 cursor-pointer"
              >
                {usarValorPersonalizado ? 'Restablecer tarifa' : 'Modificar valor'}
              </button>
            </div>
          )}

          {/* Campo opcional de valor personalizado si se desea cambiar */}
          {usarValorPersonalizado && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <label className="text-xs font-bold text-slate-600">Valor personalizado para este turno:</label>
              <input
                type="number"
                value={valorManual}
                onChange={(e) => setValorManual(e.target.value)}
                placeholder="Ej: 100000"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          )}

          {/* Campo Obligatorio en especificación: Observaciones Opcionales */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-brand-600" />
                Observaciones
              </label>
              <span className="text-[11px] text-slate-400 font-medium">(Opcional)</span>
            </div>
            <textarea
              rows={2}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ej: El cliente solicitó cambio de horario, turno adicional, etc."
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-400 shadow-xs"
            />
            {/* Ejemplos rápidos para facilitar el llenado */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                'Turno normal',
                'Cambio de horario',
                'Turno adicional',
                'Cubierto por otra persona'
              ].map(sug => (
                <button
                  type="button"
                  key={sug}
                  onClick={() => setObservaciones(sug)}
                  className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Alerta de Duplicado */}
          {mostrarAlertaDuplicado && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-2 animate-in fade-in">
              <div className="flex items-start gap-2.5 text-amber-900">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs">⚠️ Ya existe un turno registrado</h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Ya existe un turno guardado para <strong>{clienteSeleccionado?.nombre}</strong> en la fecha <strong>{formatearFechaCorta(fecha)}</strong>.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleGuardar(true)}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Sí, registrar de todos modos
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarAlertaDuplicado(false)}
                  className="px-3 bg-white border border-amber-300 text-amber-800 text-xs font-semibold py-2 rounded-xl hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={clientesActivos.length === 0}
            onClick={() => handleGuardar(false)}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md shadow-brand-600/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            GUARDAR TURNO
          </button>
        </div>
      </div>
    </div>
  );
};
