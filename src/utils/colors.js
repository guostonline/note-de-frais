/**
 * Dynamic & Distinct Color System for CDZ Responsables, Fonctions, and Entités
 */

// Preset palette for CDZ Responsables
const CDZ_COLOR_MAP = {
  "CHAKIB EL FIL": "bg-amber-100 text-amber-900 border-amber-400 font-bold shadow-2xs",
  "CHAKIB ELFIL": "bg-amber-100 text-amber-900 border-amber-400 font-bold shadow-2xs",
  "EL BESTIRI SOUFIANE": "bg-emerald-100 text-emerald-900 border-emerald-400 font-bold shadow-2xs",
  "EL MOSTAFA BOUTMEZGUINE": "bg-indigo-100 text-indigo-900 border-indigo-400 font-bold shadow-2xs",
  "BOUTMEZGUINE EL MOSTAFA": "bg-indigo-100 text-indigo-900 border-indigo-400 font-bold shadow-2xs",
  "MOHAMMED MAAIZ": "bg-purple-100 text-purple-900 border-purple-400 font-bold shadow-2xs",
  "BENSALEM NOUREDDINE": "bg-cyan-100 text-cyan-900 border-cyan-400 font-bold shadow-2xs",
  "NOUREDDINE BEN SALEM": "bg-cyan-100 text-cyan-900 border-cyan-400 font-bold shadow-2xs"
};

// Fallback color palettes generator for dynamic values
const PALETTES = [
  "bg-sky-100 text-sky-900 border-sky-300 font-semibold",
  "bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold",
  "bg-indigo-100 text-indigo-900 border-indigo-300 font-semibold",
  "bg-purple-100 text-purple-900 border-purple-300 font-semibold",
  "bg-amber-100 text-amber-900 border-amber-300 font-semibold",
  "bg-teal-100 text-teal-900 border-teal-300 font-semibold",
  "bg-rose-100 text-rose-900 border-rose-300 font-semibold",
  "bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300 font-semibold",
  "bg-lime-100 text-lime-900 border-lime-300 font-semibold",
  "bg-orange-100 text-orange-900 border-orange-300 font-semibold"
];

function stringToHash(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

/**
 * Get distinct color badge for CDZ / CDA Responsable
 */
export function getResponsableBadgeStyle(responsable = '') {
  if (!responsable) {
    return 'bg-rose-50 text-rose-700 border-rose-200 font-normal';
  }
  const clean = responsable.trim().toUpperCase();
  if (CDZ_COLOR_MAP[clean]) {
    return CDZ_COLOR_MAP[clean];
  }
  const index = stringToHash(clean) % PALETTES.length;
  return PALETTES[index];
}

/**
 * Get distinct color badge for Entité / Service
 */
export function getEntityBadgeColor(entity = '') {
  if (!entity) return 'bg-slate-100 text-slate-700 border-slate-200';
  const e = entity.trim().toUpperCase();
  
  if (e.includes('MADEC')) return 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-xs';
  if (e.includes('AGRINOVA')) return 'bg-sky-600 text-white border-sky-700 font-bold shadow-xs';
  if (e.includes('MAGHREB')) return 'bg-indigo-600 text-white border-indigo-700 font-bold shadow-xs';
  if (e.includes('SOCHAD')) return 'bg-purple-600 text-white border-purple-700 font-bold shadow-xs';
  if (e.includes('AFRICA')) return 'bg-amber-600 text-white border-amber-700 font-bold shadow-xs';
  
  const index = stringToHash(e) % PALETTES.length;
  return PALETTES[index];
}

/**
 * Get distinct color badge for Fonction / Poste
 */
export function getFonctionBadgeColor(fonction = '') {
  if (!fonction) return 'bg-slate-100 text-slate-500 border-slate-200 font-normal';
  const f = fonction.trim().toUpperCase();
  
  if (f === 'CDZ' || f.includes('ZONE')) return 'bg-amber-500 text-white border-amber-600 font-bold shadow-xs';
  if (f === 'CDA') return 'bg-purple-600 text-white border-purple-700 font-bold shadow-xs';
  if (f.includes('DIRECTEUR') || f.includes('CHEF')) return 'bg-indigo-700 text-white border-indigo-800 font-bold shadow-xs';
  if (f.includes('COMMERCIAL') || f.includes('VENTE')) return 'bg-sky-600 text-white border-sky-700 font-semibold shadow-xs';
  if (f.includes('INGENIEUR') || f.includes('TECH')) return 'bg-teal-600 text-white border-teal-700 font-semibold shadow-xs';
  
  const index = stringToHash(f) % PALETTES.length;
  return PALETTES[index];
}

export function getResponsableSelectStyle(responsable = '') {
  if (!responsable) return 'bg-rose-50 text-rose-800 border-rose-200 font-medium hover:bg-rose-100';
  return getResponsableBadgeStyle(responsable);
}
