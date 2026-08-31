import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Turno } from '../types';
import { formatearFechaCompleta, getDiaSemana, formatearFechaCorta } from '../utils/dateUtils';
import { formatearMoneda } from '../utils/formatters';
import { 
  Clock, 
  X, 
  Check, 
  Trash2, 
  FileText, 
  AlertTriangle, 
  DollarSign, 
  Calendar, 
  User,
  AlertCircle
} from 'lucide-react';

interface ModalEditarTurnoProps {
  isOpen: boolean;
  onClose: () => void;
  turno: Turno | null;
}

export const ModalEditarTurno: React.FC<ModalEditarTurnoProps> = ({
  isOpen,
  onClose,
  turno
}) => {
  const { clientes, actualizarTurno, anularTurno, eliminarTurno } = useApp();

  const [clienteId, setClienteId] = useState('');
  const [fecha, setFecha] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [valor, setValor] = useState('');
  const [mostrarConfirmEliminar, setMostrarConfirmEliminar] = useState(false);
  const [mostrarConfirmAnular, setMostrarConfirmAnular] = useState(false);

  useEffect(() => {
    if (isOpen && turno) {
      setClienteId(turno.clienteId);
      setFecha(turno.fecha);
      setObservaciones(turno.observaciones || '');
      setValor(turno.valor.toString());
      setMostrarConfirmEliminar(false);
      setMostrarConfirmAnular(false);
    }
  }, [isOpen, turno]);

  if (!isOpen || !turno) return null;

  const diaSemanaCalculado = fecha ? getDiaSemana(fecha) : turno.diaSemana;
  const clienteActual = clientes.find(c => c.id === clienteId) || { nombre: turno.clienteNombre };

  const handleGuardar = () => {
    const valorNum = parseFloat(valor);
    if (isNaN(valorNum) || valorNum <= 0) return;
    if (!fecha) return;

    actualizarTurno({
      ...turno,
      clienteId: clienteId || turno.clienteId,
      clienteNombre: clienteActual.nombre,
      fecha,
      diaSemana: diaSemanaCalculado,
      valor: valorNum,
      observaciones: observaciones.trim() || undefined
    });
    onClose();
  };

  const handleEliminarDefinitivo = () => {
    eliminarTurno(turno.id);
    onClose();
  };

  const handleAnular = () => {
    anularTurno(turno.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">Editar Turno</h2>
              <p className="text-xs text-slate-300 font-medium">{clienteActual.nombre}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Info Status Card */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
            <span className="text-slate-600 font-semibold">Estado actual:</span>
            <span className={`font-black px-2.5 py-0.5 rounded-full text-[10px] uppercase ${
              turno.estado === 'Cobrado' 
                ? 'bg-emerald-100 text-emerald-800' 
                : turno.estado === 'Anulado'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {turno.estado}
            </span>
          </div>

          {/* Cliente */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-brand-600" />
              Cliente
            </label>
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-brand-500"
            >
              {clientes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha y Día de la Semana */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-brand-600" />
                Fecha del Turno *
              </span>
              <span className="text-brand-700 font-black text-xs">
                Día: {diaSemanaCalculado}
              </span>
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-brand-500 shadow-2xs"
            />
          </div>

          {/* Valor */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              Valor del Turno ($) *
            </label>
            <input
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-black text-slate-900 focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Observaciones */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Observaciones (Ej: Oficina, Finca, etc.)
            </label>
            <textarea
              rows={2}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Escribe observaciones específicas sobre este turno..."
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* BOTÓN: ELIMINAR TURNO (Solicitado por el usuario) */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            {!mostrarConfirmEliminar ? (
              <button
                type="button"
                onClick={() => setMostrarConfirmEliminar(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                Eliminar Turno Definitivamente
              </button>
            ) : (
              <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-2xl space-y-2.5 animate-in fade-in">
                <div className="flex items-center gap-2 text-rose-900 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  ¿Estás seguro de eliminar este turno? Esta acción no se puede deshacer.
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleEliminarDefinitivo}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    Sí, Eliminar
                  </button>
                  <button
                    type="button"
                    onClick={() => setMostrarConfirmEliminar(false)}
                    className="px-3 bg-white border border-rose-300 text-rose-800 text-xs font-semibold py-2 rounded-xl hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleGuardar}
            className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};
