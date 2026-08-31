import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Cliente, EstadoCliente } from '../types';
import { formatearMoneda } from '../utils/formatters';
import { Users, X, Check, DollarSign, Phone, MapPin, Hash, FileText, AlertCircle } from 'lucide-react';

interface ModalNuevoClienteProps {
  isOpen: boolean;
  onClose: () => void;
  clienteEditar?: Cliente | null;
}

export const ModalNuevoCliente: React.FC<ModalNuevoClienteProps> = ({
  isOpen,
  onClose,
  clienteEditar
}) => {
  const { agregarCliente, actualizarCliente } = useApp();

  const [nombre, setNombre] = useState('');
  const [identificacion, setIdentificacion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [valorTurno, setValorTurno] = useState('');
  const [estado, setEstado] = useState<EstadoCliente>('Activo');
  const [observacionesGenerales, setObservacionesGenerales] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      if (clienteEditar) {
        setNombre(clienteEditar.nombre);
        setIdentificacion(clienteEditar.identificacion || '');
        setTelefono(clienteEditar.telefono || '');
        setDireccion(clienteEditar.direccion || '');
        setValorTurno(clienteEditar.valorTurnoActual.toString());
        setEstado(clienteEditar.estado);
        setObservacionesGenerales(clienteEditar.observacionesGenerales || '');
      } else {
        setNombre('');
        setIdentificacion('');
        setTelefono('');
        setDireccion('');
        setValorTurno('100000');
        setEstado('Activo');
        setObservacionesGenerales('');
      }
    }
  }, [isOpen, clienteEditar]);

  if (!isOpen) return null;

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nombre.trim()) {
      setErrorMsg('El nombre del cliente es obligatorio.');
      return;
    }

    const valorNum = parseFloat(valorTurno);
    if (isNaN(valorNum) || valorNum <= 0) {
      setErrorMsg('Debes especificar un valor de turno válido y mayor a cero.');
      return;
    }

    if (clienteEditar) {
      actualizarCliente({
        ...clienteEditar,
        nombre: nombre.trim(),
        identificacion: identificacion.trim() || undefined,
        telefono: telefono.trim(),
        direccion: direccion.trim(),
        valorTurnoActual: valorNum,
        estado,
        observacionesGenerales: observacionesGenerales.trim() || undefined
      });
    } else {
      agregarCliente({
        nombre: nombre.trim(),
        identificacion: identificacion.trim() || undefined,
        telefono: telefono.trim(),
        direccion: direccion.trim(),
        valorTurnoActual: valorNum,
        estado,
        observacionesGenerales: observacionesGenerales.trim() || undefined
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-xs">
              <Users className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">
                {clienteEditar ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              <p className="text-xs text-blue-100 font-medium">Gestión de cuentas y tarifas</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleGuardar} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Nombre */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Nombre Completo *
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Juan Pérez / Empresa SAS"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            />
          </div>

          {/* Tarifa / Valor por turno */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
            <label className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-700" />
              Valor del Turno Actual ($) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="1000"
              value={valorTurno}
              onChange={(e) => setValorTurno(e.target.value)}
              placeholder="Ej: 100000"
              className="w-full bg-white border border-emerald-300 rounded-xl px-3.5 py-2.5 text-base font-black text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
            <p className="text-[11px] text-emerald-700">
              * Los turnos nuevos usarán esta tarifa. Los turnos históricos anteriores conservarán su valor original intacto.
            </p>
          </div>

          {/* Identificación y Teléfono */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                Cédula / NIT (Opcional)
              </label>
              <input
                type="text"
                value={identificacion}
                onChange={(e) => setIdentificacion(e.target.value)}
                placeholder="Ej: CC 10203040"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Teléfono / WhatsApp
              </label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej: 300 123 4567"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Dirección */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Dirección
            </label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Ej: Calle 100 # 15-20"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Estado */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Estado del Cliente
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Activo', 'Inactivo'] as EstadoCliente[]).map(st => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setEstado(st)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    estado === st
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {st === 'Activo' ? '🟢 Activo' : '⚪ Inactivo'}
                </button>
              ))}
            </div>
          </div>

          {/* Observaciones generales */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Observaciones Generales
            </label>
            <textarea
              rows={2}
              value={observacionesGenerales}
              onChange={(e) => setObservacionesGenerales(e.target.value)}
              placeholder="Notas generales sobre el cliente, acuerdos de pago, etc."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Footer inside form */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {clienteEditar ? 'GUARDAR CAMBIOS' : 'CREAR CLIENTE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
