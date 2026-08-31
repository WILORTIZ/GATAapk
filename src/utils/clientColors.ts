export interface ColorPalette {
  id: string;
  name: string;
  dot: string;
  bgLight: string;
  bgSolid: string;
  textDark: string;
  border: string;
  badge: string;
}

export const PALETA_COLORES_CLIENTES: ColorPalette[] = [
  {
    id: 'green',
    name: 'Verde',
    dot: '#16a34a',
    bgLight: 'bg-emerald-50',
    bgSolid: 'bg-emerald-600',
    textDark: 'text-emerald-800',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  {
    id: 'blue',
    name: 'Azul',
    dot: '#2563eb',
    bgLight: 'bg-blue-50',
    bgSolid: 'bg-blue-600',
    textDark: 'text-blue-800',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'black',
    name: 'Negro',
    dot: '#0f172a',
    bgLight: 'bg-slate-100',
    bgSolid: 'bg-slate-900',
    textDark: 'text-slate-900',
    border: 'border-slate-300',
    badge: 'bg-slate-200 text-slate-900 border-slate-300'
  },
  {
    id: 'red',
    name: 'Rojo',
    dot: '#dc2626',
    bgLight: 'bg-rose-50',
    bgSolid: 'bg-rose-600',
    textDark: 'text-rose-800',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-800 border-rose-200'
  },
  {
    id: 'purple',
    name: 'Morado',
    dot: '#9333ea',
    bgLight: 'bg-purple-50',
    bgSolid: 'bg-purple-600',
    textDark: 'text-purple-800',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  {
    id: 'amber',
    name: 'Naranja / Ámbar',
    dot: '#d97706',
    bgLight: 'bg-amber-50',
    bgSolid: 'bg-amber-600',
    textDark: 'text-amber-800',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  {
    id: 'teal',
    name: 'Verde Azulado / Teal',
    dot: '#0d9488',
    bgLight: 'bg-teal-50',
    bgSolid: 'bg-teal-600',
    textDark: 'text-teal-800',
    border: 'border-teal-200',
    badge: 'bg-teal-100 text-teal-800 border-teal-200'
  },
  {
    id: 'cyan',
    name: 'Cian',
    dot: '#0891b2',
    bgLight: 'bg-cyan-50',
    bgSolid: 'bg-cyan-600',
    textDark: 'text-cyan-800',
    border: 'border-cyan-200',
    badge: 'bg-cyan-100 text-cyan-800 border-cyan-200'
  }
];

/**
 * Retorna una paleta de color para un cliente según su color asignado, ID o nombre
 */
export function getClienteColor(clienteId: string, clienteNombre?: string, clienteColor?: string): ColorPalette {
  // 1. Si tiene color explícito
  if (clienteColor) {
    const colLower = clienteColor.toLowerCase().trim();
    if (colLower.includes('verde') || colLower === 'green' || colLower === 'emerald') {
      return PALETA_COLORES_CLIENTES[0];
    }
    if (colLower.includes('azul') || colLower === 'blue') {
      return PALETA_COLORES_CLIENTES[1];
    }
    if (colLower.includes('negro') || colLower === 'black' || colLower === 'dark') {
      return PALETA_COLORES_CLIENTES[2];
    }
    if (colLower.includes('rojo') || colLower === 'red' || colLower === 'rose') {
      return PALETA_COLORES_CLIENTES[3];
    }
    if (colLower.includes('morado') || colLower === 'purple') {
      return PALETA_COLORES_CLIENTES[4];
    }
    if (colLower.includes('naranja') || colLower === 'ambar' || colLower === 'amber') {
      return PALETA_COLORES_CLIENTES[5];
    }
  }

  // 2. Si el nombre coincide con clientes conocidos
  if (clienteNombre) {
    const nomLower = clienteNombre.toLowerCase();
    if (nomLower.includes('diego osorio')) return PALETA_COLORES_CLIENTES[0]; // Verde
    if (nomLower.includes('harley')) return PALETA_COLORES_CLIENTES[1]; // Azul
    if (nomLower.includes('denia erazo')) return PALETA_COLORES_CLIENTES[2]; // Negro
    if (nomLower.includes('harmoni')) return PALETA_COLORES_CLIENTES[3]; // Rojo
  }

  if (!clienteId && !clienteNombre) return PALETA_COLORES_CLIENTES[0];
  
  const clave = clienteId || clienteNombre || '';
  let hash = 0;
  for (let i = 0; i < clave.length; i++) {
    hash = clave.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % PALETA_COLORES_CLIENTES.length;
  return PALETA_COLORES_CLIENTES[index];
}
