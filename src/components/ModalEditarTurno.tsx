import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Turno } from '../types';
import { formatearFechaCompleta } from '../utils/dateUtils';
import { formatearMoneda } from '../utils/formatters';
import { Clock, X, Check, Trash2, FileText, AlertTriangle, DollarSign } from 'lucide-react';

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
  const { actualizarTurno, anularTurno } = useApp();

  const [observaciones, setObservaciones] = useState('');
  const [valor, setValor] = useState('');
  const [mostrarConfirmAnular, setMostrarConfirmAnular] = useState(false);

  useEffect(() => {
    if (isOpen && turno) {
      setObservaciones(turno.observaciones || '');
      setValor(turno.valor.toString());
      setMostrarConfirmAnular(false);
    }
  }, [isOpen, turno]);

  if (!isOpen || !turno) return null;

  const handleGuardar = () => {
    const valorNum = parseFloat(valor);
    if (isNaN(valorNum) || valorNum <= 0) return;

    actualizarTurno({
      ...turno,
      valor: valorNum,
      observaciones: observaciones.trim() || undefined
    });
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
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">Detalle del Turno</h2>
              <p className="text-xs text-slate-300 font-medium">{turno.clienteNombre}</p>
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
          
          {/* Info Card */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Fecha:</span>
              <span className="font-bold text-slate-800">{formatearFechaCompleta(turno.fecha)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Estado:</span>
              <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] uppercase ${
                turno.estado === 'Cobrado' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : turno.estado === 'Anulado'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {turno.estado}
              </span>
            </div>
          </div>

          {/* Valor */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              Valor del Turno ($)
            </label>
            <input
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-black text-slate-800 focus:ring-2 focus:ring-slate-500"
            />
          </div>

          {/* Observaciones */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Observaciones del Turno
            </label>
            <textarea
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Escribe observaciones específicas sobre este turno..."
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-slate-500"
            />
          </div>

          {/* Anular turno (Sin eliminación física) */}
          {turno.estado !== 'Anulado' && (
            <div>
              {!mostrarConfirmAnular ? (
                <button
                  type="button"
                  onClick={() => setMostrarConfirmAnular(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Anular este Turno (Conservar en historial)
                </button>
              ) : (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-rose-900 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    ¿Confirmas anular este turno?
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAnular}
                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Sí, Anular
                    </button>
                    <button
                      type="button"
                      onClick={() => setMostrarConfirmAnular(false)}
                      className="px-3 bg-white border border-rose-300 text-rose-800 text-xs font-semibold py-1.5 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handleGuardar}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};
