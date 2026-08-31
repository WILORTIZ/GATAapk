import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl max-w-sm w-full space-y-4">
            <div className="w-14 h-14 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center mx-auto text-rose-600">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Algo no salió bien</h2>
              <p className="text-xs text-slate-500 mt-1">
                La aplicación se recuperó de un problema. Toca el botón para continuar.
              </p>
            </div>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
              <span>Recargar Aplicación</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
