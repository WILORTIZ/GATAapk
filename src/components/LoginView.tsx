import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, User, KeyRound, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { iniciarSesion } = useApp();
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setMensajeError('');

    if (!usuario.trim() || !clave.trim()) {
      setError(true);
      setMensajeError('Por favor ingresa tu usuario y contraseña.');
      return;
    }

    const exito = iniciarSesion(usuario, clave);
    if (!exito) {
      setError(true);
      setMensajeError('Usuario o contraseña incorrectos. Verifica tus credenciales.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 select-none">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Logo & Encabezado */}
        <div className="text-center space-y-2">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center p-2 shadow-inner">
            <img 
              src="/cat-icon.png" 
              alt="GATA Icon" 
              className="w-full h-full object-contain rounded-2xl drop-shadow-sm" 
            />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              GATA
            </h1>
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Control de Turnos y Cobros
            </p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Input Usuario */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Usuario
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                autoCapitalize="none"
                autoCorrect="off"
                value={usuario}
                onChange={(e) => {
                  setUsuario(e.target.value);
                  setError(false);
                }}
                placeholder="Ingresa usuario (ej: gata)"
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Input Contraseña */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={clave}
                onChange={(e) => {
                  setClave(e.target.value);
                  setError(false);
                }}
                placeholder="Ingresa tu clave"
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{mensajeError}</span>
            </div>
          )}

          {/* Botón Ingresar */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:to-orange-700 active:scale-[0.98] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>INGRESAR A GATA</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-2 text-center border-t border-slate-100">
          <p className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Acceso seguro y 100% autónomo offline
          </p>
        </div>
      </div>
    </div>
  );
};
