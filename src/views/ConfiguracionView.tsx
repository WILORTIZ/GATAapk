import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Settings, 
  Download, 
  Upload, 
  RotateCcw, 
  ShieldCheck, 
  Smartphone, 
  Check, 
  AlertTriangle, 
  FileJson, 
  Save 
} from 'lucide-react';

export const ConfiguracionView: React.FC = () => {
  const { 
    clientes, 
    turnos, 
    cobros, 
    cierres, 
    config, 
    actualizarConfig, 
    restablecerDatos, 
    importarDatos 
  } = useApp();

  const [nombreNegocio, setNombreNegocio] = useState(config.nombreNegocio);
  const [propietario, setPropietario] = useState(config.propietario);
  const [moneda, setMoneda] = useState(config.moneda);
  const [mensajeGuardado, setMensajeGuardado] = useState(false);
  const [mostrarConfirmReset, setMostrarConfirmReset] = useState(false);

  const handleGuardarConfig = (e: React.FormEvent) => {
    e.preventDefault();
    actualizarConfig({
      ...config,
      nombreNegocio,
      propietario,
      moneda
    });
    setMensajeGuardado(true);
    setTimeout(() => setMensajeGuardado(false), 3000);
  };

  // Exportar respaldo JSON completo
  const exportarRespaldoJSON = () => {
    const backupData = {
      app: 'GATA',
      version: '1.0.0',
      fechaExportacion: new Date().toISOString(),
      clientes,
      turnos,
      cobros,
      cierres,
      config
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `GATA_Respaldo_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Importar respaldo JSON
  const handleImportarJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && Array.isArray(parsed.clientes) && Array.isArray(parsed.turnos)) {
            importarDatos(parsed);
            alert('¡Copia de seguridad restaurada con éxito!');
          } else {
            alert('El archivo no contiene un formato de respaldo válido de GATA.');
          }
        } catch {
          alert('Error al leer el archivo JSON.');
        }
      };
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Header Configuración */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Settings className="w-4 h-4" />
            Ajustes del Sistema
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            ⚙️ CONFIGURACIÓN
          </h2>
          <p className="text-xs text-slate-300 font-medium">
            Personalización, copias de seguridad e información de la aplicación
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-2xl text-xs font-bold">
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span>GATA para Android</span>
        </div>
      </div>

      {/* Formulario de Ajustes Generales */}
      <form onSubmit={handleGuardarConfig} className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base">
          Datos de la Cuenta y Negocio
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Nombre de la Aplicación / Negocio
            </label>
            <input
              type="text"
              value={nombreNegocio}
              onChange={(e) => setNombreNegocio(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Nombre del Propietario / Administrador
            </label>
            <input
              type="text"
              value={propietario}
              onChange={(e) => setPropietario(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-slate-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {mensajeGuardado ? (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
              <Check className="w-4 h-4 stroke-[3]" /> ¡Cambios guardados correctamente!
            </span>
          ) : (
            <div />
          )}

          <button
            type="submit"
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Guardar Ajustes
          </button>
        </div>
      </form>

      {/* Respaldo y Restauración */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          Copia de Seguridad y Respaldos (Offline)
        </h3>
        <p className="text-xs text-slate-500">
          Tus datos se guardan de forma 100% segura y privada en tu dispositivo Android. Puedes exportar una copia en cualquier momento.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Exportar JSON */}
          <button
            type="button"
            onClick={exportarRespaldoJSON}
            className="p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 flex items-center gap-3 transition-colors cursor-pointer text-left"
          >
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-800">Descargar Copia de Seguridad</div>
              <div className="text-[11px] text-slate-500">Exportar todo a archivo JSON</div>
            </div>
          </button>

          {/* Importar JSON */}
          <label className="p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 flex items-center gap-3 transition-colors cursor-pointer text-left">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-800">Restaurar Copia de Seguridad</div>
              <div className="text-[11px] text-slate-500">Cargar archivo JSON previo</div>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleImportarJSON}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Restablecer o Reiniciar datos */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base text-rose-700 flex items-center gap-2">
          <RotateCcw className="w-5 h-5" />
          Restablecer Aplicación
        </h3>
        <p className="text-xs text-slate-500">
          Reinicia todos los datos a la demostración inicial predeterminada.
        </p>

        {!mostrarConfirmReset ? (
          <button
            type="button"
            onClick={() => setMostrarConfirmReset(true)}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors cursor-pointer"
          >
            Restablecer a Datos Iniciales
          </button>
        ) : (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-rose-900 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              ¿Estás seguro de restablecer todos los clientes y turnos?
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  restablecerDatos();
                  setMostrarConfirmReset(false);
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Sí, Restablecer
              </button>
              <button
                type="button"
                onClick={() => setMostrarConfirmReset(false)}
                className="px-4 py-1.5 bg-white border border-rose-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Acerca de GATA */}
      <div className="p-5 text-center text-xs text-slate-400 space-y-1">
        <p className="font-bold text-slate-600">GATA — Aplicación de Turnos y Cobros v1.0.0</p>
        <p>Optimizada para Android • Funcionamiento 100% Offline</p>
      </div>

    </div>
  );
};
