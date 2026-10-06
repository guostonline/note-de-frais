/**
 * Intelligent Name Matching and Analysis Engine
 */
import { initialCollaborateurs } from '../data/defaultData.js';

export function cleanStr(str) {
  if (!str || typeof str !== 'string') return '';
  // Normalize accents and remove special characters
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Returns sorted words as a single string for order-agnostic comparison
 * (e.g. "BOUDRAR ALI" vs "ALI ABOUDRAR" => "ALI BOUDRAR")
 */
export function getSortedWords(name) {
  const cleaned = cleanStr(name);
  if (!cleaned) return '';
  return cleaned.split(' ').sort().join(' ');
}

/**
 * Fast Levenshtein distance computation
 */
export function levenshteinDistance(a = '', b = '') {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  const d = [];
  for (let i = 0; i <= m; i++) d[i] = [i];
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }
  return d[m][n];
}

/**
 * Calculates similarity score between two names [0.0 to 1.0]
 */
export function calculateSimilarity(name1, name2) {
  const n1 = cleanStr(name1);
  const n2 = cleanStr(name2);
  if (!n1 || !n2) return 0;
  if (n1 === n2) return 1.0;

  const sorted1 = getSortedWords(name1);
  const sorted2 = getSortedWords(name2);
  if (sorted1 === sorted2) return 1.0;

  const tokens1 = Array.from(new Set(n1.split(' ').filter(Boolean)));
  const tokens2 = Array.from(new Set(n2.split(' ').filter(Boolean)));
  if (!tokens1.length || !tokens2.length) return 0;

  let matchedTokens = 0;
  tokens1.forEach(t1 => {
    let best = 0;
    tokens2.forEach(t2 => {
      if (t1 === t2) {
        best = Math.max(best, 1.0);
      } else if (t1.length > 2 && t2.length > 2) {
        const maxLen = Math.max(t1.length, t2.length);
        const lev = levenshteinDistance(t1, t2);
        const sim = (maxLen - lev) / maxLen;
        if (sim >= 0.70) {
          best = Math.max(best, sim);
        } else if (t1.includes(t2) || t2.includes(t1)) {
          best = Math.max(best, 0.8);
        }
      }
    });
    matchedTokens += best;
  });

  const tokenScore = (2 * matchedTokens) / (tokens1.length + tokens2.length);
  return tokenScore;
}

// Memoization cache for fast demandeur matching
const matchCache = new Map();

/**
 * Finds best collaborator match for a given Frais demandeur
 */
export function matchDemandeurToCollaborateur(demandeurName, colaboradoresList, aliasMap = {}) {
  if (!demandeurName) return { collaborateur: null, score: 0, isAlias: false };

  const cacheKey = `${demandeurName}_${(colaboradoresList || []).length}_${aliasMap[demandeurName] || ''}`;
  if (matchCache.has(cacheKey)) {
    return matchCache.get(cacheKey);
  }

  let result = null;

  // 1. Check user custom manual alias mapping (direct or normalized)
  const cleanDem = cleanStr(demandeurName);
  const sortedDem = getSortedWords(demandeurName);

  let targetAlias = aliasMap[demandeurName] || aliasMap[cleanDem] || aliasMap[sortedDem];
  if (!targetAlias && aliasMap) {
    for (const [k, v] of Object.entries(aliasMap)) {
      if (cleanStr(k) === cleanDem || getSortedWords(k) === sortedDem) {
        targetAlias = v;
        break;
      }
    }
  }

  if (targetAlias) {
    const matchedCollab = (colaboradoresList || []).find(c => 
      c.Nom === targetAlias || cleanStr(c.Nom) === cleanStr(targetAlias)
    );
    if (matchedCollab) {
      result = { collaborateur: matchedCollab, score: 1.0, isAlias: true };
    }
  }

  if (!result) {
    // 2. Direct exact or sorted word match
    for (const collab of (colaboradoresList || [])) {
      if (getSortedWords(collab.Nom) === sortedDem || cleanStr(collab.Nom) === cleanDem) {
        result = { collaborateur: collab, score: 1.0, isAlias: false };
        break;
      }
    }
  }

  if (!result) {
    // 3. Fuzzy search for best candidate
    let bestCollab = null;
    let maxScore = 0;

    for (const collab of (colaboradoresList || [])) {
      const score = calculateSimilarity(demandeurName, collab.Nom);
      if (score > maxScore) {
        maxScore = score;
        bestCollab = collab;
      }
    }

    result = {
      collaborateur: maxScore >= 0.6 ? bestCollab : null,
      score: maxScore,
      isAlias: false
    };
  }

  matchCache.set(cacheKey, result);
  return result;
}

/**
 * Normalizes Frais objects array from Excel uploads
 * Automatically standardizes Demandeur to canonical Collaborateur Nom if matched
 */
export function normalizeFraisData(fraisArray = [], collabList = [], aliasMap = {}) {
  if (!Array.isArray(fraisArray)) return [];
  return fraisArray.map((item, index) => {
    if (!item || typeof item !== 'object') return item;
    const keys = Object.keys(item);

    // Dynamic column matching regexes
    const demandeurKey = keys.find(k => /demandeur|vendeur|employe|employé|collaborateur|commercial|représentant/i.test(k)) || 'Demandeur';
    const moisKey = keys.find(k => /^mois/i.test(k)) || 'Mois';
    const semaineKey = keys.find(k => /^semaine|sem/i.test(k)) || 'Semaine';
    const refKey = keys.find(k => /ref|référence|code|id|num/i.test(k)) || 'Reference';
    const socKey = keys.find(k => /société|societe|entité|entreprise/i.test(k)) || 'Societe';
    const etatKey = keys.find(k => /etat|état|statut|status/i.test(k)) || 'Etat de la demande';
    const etapesKey = keys.find(k => /étape|etape|step/i.test(k)) || 'Etapes en cours';
    const intervenantsKey = keys.find(k => /intervenant|reviewer|approver/i.test(k)) || 'Intervenants en cours';
    const urlKey = keys.find(k => /url|document|link|lien|ged/i.test(k)) || 'URL du document';
    const dateKey = keys.find(k => /date/i.test(k)) || 'Date de création';

    let demandeurVal = item[demandeurKey] !== undefined ? String(item[demandeurKey]).trim() : (item.Demandeur || '');
    const moisVal = item[moisKey] !== undefined ? String(item[moisKey]).trim() : (item.Mois || '');
    const semaineVal = item[semaineKey] !== undefined ? String(item[semaineKey]).trim() : (item.Semaine || '');
    const refVal = item[refKey] !== undefined ? String(item[refKey]).trim() : (item.Reference || '');
    const socVal = item[socKey] !== undefined ? String(item[socKey]).trim() : (item.Societe || '');
    const etatVal = item[etatKey] !== undefined ? String(item[etatKey]).trim() : (item['Etat de la demande'] || item.EtatDemande || 'Non spécifié');
    const etapesVal = item[etapesKey] !== undefined ? String(item[etapesKey]).trim() : (item['Etapes en cours'] || item.EtapesEnCours || '');
    const intervenantsVal = item[intervenantsKey] !== undefined ? String(item[intervenantsKey]).trim() : (item['Intervenants en cours'] || item.IntervenantsEnCours || '');
    const urlVal = item[urlKey] !== undefined ? String(item[urlKey]).trim() : (item['URL du document'] || item.UrlDocument || '');
    const dateVal = item[dateKey] !== undefined ? String(item[dateKey]).trim() : (item['Date de création'] || item.DateCreation || '');

    // Canonical name resolution
    if (demandeurVal && Array.isArray(collabList) && collabList.length > 0) {
      const match = matchDemandeurToCollaborateur(demandeurVal, collabList, aliasMap);
      if (match && match.collaborateur && match.collaborateur.Nom) {
        demandeurVal = match.collaborateur.Nom;
      }
    }

    return {
      ...item,
      id: item.id || index + 1,
      Demandeur: demandeurVal,
      Mois: moisVal,
      Semaine: semaineVal,
      Reference: refVal,
      Societe: socVal,
      'Etat de la demande': etatVal,
      EtatDemande: etatVal,
      'Etapes en cours': etapesVal,
      EtapesEnCours: etapesVal,
      'Intervenants en cours': intervenantsVal,
      IntervenantsEnCours: intervenantsVal,
      'URL du document': urlVal,
      UrlDocument: urlVal,
      'Date de création': dateVal,
      DateCreation: dateVal
    };
  });
}

/**
 * Normalizes strings for robust filter comparison (handles accent variations, whitespace, Unicode NFC, case)
 */
export function normalizeFilterStr(str = '') {
  if (!str) return '';
  return String(str)
    .normalize('NFC')
    .trim()
    .toLowerCase()
    .replace(/[ûùúü]/g, 'u')
    .replace(/aot/g, 'aout');
}

/**
 * Builds a map of Collaborateur Nom -> Array of submitted Frais records for a filtered period
 */
export function buildSubmissionMap(collabList, fraisList, monthFilter = 'ALL', weekFilter = 'ALL', aliasMap = {}, statusFilter = 'ALL') {
  const norm = normalizeFilterStr;

  // Filter frais by period and status (supporting string 'ALL', empty array [], or multi-select array)
  const filteredFrais = (fraisList || []).filter(item => {
    // Month filter check
    let matchMonth = true;
    const itemMois = item.Mois || item.mois || item['Mois'] || '';
    if (Array.isArray(monthFilter)) {
      if (monthFilter.length > 0 && !monthFilter.includes('ALL')) {
        const normMonths = monthFilter.map(norm);
        matchMonth = normMonths.includes(norm(itemMois));
      }
    } else if (monthFilter !== 'ALL' && monthFilter !== '') {
      matchMonth = norm(itemMois) === norm(monthFilter);
    }

    // Week filter check
    let matchWeek = true;
    const itemSemaine = item.Semaine || item.semaine || item['Semaine'] || '';
    if (Array.isArray(weekFilter)) {
      if (weekFilter.length > 0 && !weekFilter.includes('ALL')) {
        const normWeeks = weekFilter.map(norm);
        matchWeek = normWeeks.includes(norm(itemSemaine));
      }
    } else if (weekFilter !== 'ALL' && weekFilter !== '') {
      matchWeek = norm(itemSemaine) === norm(weekFilter);
    }

    // Status filter check
    let matchStatus = true;
    const itemEtat = item['Etat de la demande'] || item.EtatDemande || item.etat_demande || '';
    if (Array.isArray(statusFilter)) {
      if (statusFilter.length > 0 && !statusFilter.includes('ALL')) {
        const normStatuses = statusFilter.map(norm);
        matchStatus = normStatuses.includes(norm(itemEtat));
      }
    } else if (statusFilter !== 'ALL' && statusFilter !== '') {
      matchStatus = norm(itemEtat) === norm(statusFilter);
    }

    return matchMonth && matchWeek && matchStatus;
  });

  // Map each collaborator
  const map = {};
  (collabList || []).forEach(collab => {
    map[collab.Nom] = {
      collaborateur: collab,
      submissions: [],
      hasSubmitted: false
    };
  });

  const unmatchedFrais = [];

  filteredFrais.forEach(fraisItem => {
    const { collaborateur, score } = matchDemandeurToCollaborateur(fraisItem.Demandeur, collabList, aliasMap);
    if (collaborateur && map[collaborateur.Nom]) {
      map[collaborateur.Nom].submissions.push(fraisItem);
      map[collaborateur.Nom].hasSubmitted = true;
    } else {
      unmatchedFrais.push(fraisItem);
    }
  });

  return { map, filteredFraisCount: filteredFrais.length, unmatchedFrais };
}

/**
 * Known standard expense report statuses from Excel
 */
export const ALL_STANDARD_STATUSES = [
  'Annulée',
  'En attente validation Comptable',
  'En attente validation Dir Commercial',
  'En attente validation Dir des ventes',
  'En attente validation Dir Vente CHR',
  'En attente validation N+2',
  'Note de frais acceptée',
  'Note de frais rejetée'
];

/**
 * Extracts unique statuses from frais list, ensuring standard statuses are included
 */
export function getUniqueStatuses(fraisList = []) {
  const dynamicStatuses = (fraisList || [])
    .map(f => (f['Etat de la demande'] || f.EtatDemande))
    .filter(Boolean);
  const set = new Set([...ALL_STANDARD_STATUSES, ...dynamicStatuses]);
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'));
}


/**
 * Extracts unique months from frais list in order
 */
export function getUniqueMonths(fraisList = []) {
  const norm = normalizeFilterStr;
  const monthOrder = ['Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const normFraisMonths = new Set((fraisList || []).map(f => norm(f.Mois || f.mois)).filter(Boolean));
  return monthOrder.filter(m => normFraisMonths.has(norm(m)));
}

/**
 * Extracts unique weeks from frais list for a specific month
 */
export function getUniqueWeeks(fraisList = [], month = 'ALL') {
  const norm = normalizeFilterStr;
  let list = fraisList || [];
  if (Array.isArray(month)) {
    if (month.length > 0 && !month.includes('ALL')) {
      const normMonths = month.map(norm);
      list = list.filter(f => normMonths.includes(norm(f.Mois || f.mois)));
    }
  } else if (month !== 'ALL' && month !== '') {
    const normMonth = norm(month);
    list = list.filter(f => norm(f.Mois || f.mois) === normMonth);
  }
  const weeks = Array.from(new Set(list.map(f => f.Semaine || f.semaine).filter(Boolean)));
  // Sort weeks numerically if S1, S2, etc.
  return weeks.sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
    return numA - numB;
  });
}


/**
 * Extracts unique entities from collaborateurs list
 */
export function getUniqueEntities(collabList) {
  return Array.from(new Set(collabList.map(c => c.Entite).filter(Boolean))).sort();
}

/**
 * Extracts unique functions from collaborateurs list combined with default standard functions (CDZ, CDA, etc.)
 */
export function getUniqueFonctions(collabList = []) {
  const defaultFonctions = [
    'CDZ',
    'CDA',
    'AIDE LIVREUR',
    'AIDE VENDEUR',
    'CONVOYEUR',
    'CONVOYEUR SAHARA',
    'LIVREUR',
    'LIVREUR REMPLACANT',
    'PREVENDEUR',
    'PREVENDEUR GROS',
    'PREVENDEUR REMPLACANT',
    'PREVENDEUR SUPERETTE',
    'VENDEUR',
    'VENDEUR GROS',
    'VENDEUR LIVREUR'
  ];

  const customFromList = collabList
    .map(c => c.Fonction)
    .filter(Boolean)
    .map(f => String(f).trim().toUpperCase());

  const allSet = new Set([...defaultFonctions, ...customFromList]);
  return Array.from(allSet).sort();
}

export const DEFAULT_CDZ_RESPONSABLES = [
  'CHAKIB EL FIL',
  'EL BESTIRI SOUFIANE',
  'EL MOSTAFA BOUTMEZGUINE',
  'MOHAMMED MAAIZ',
  'BENSALEM NOUREDDINE'
];

/**
 * Ensures every collaborator has a valid CDZ / CDA Responsable assigned
 */
export function ensureCollaborateursHasResponsable(collabList = []) {
  if (!Array.isArray(collabList)) return [];

  // Build a lookup map of known real responsables from default dataset
  const knownRespMap = new Map();
  if (Array.isArray(initialCollaborateurs)) {
    initialCollaborateurs.forEach(c => {
      if (c && c.Nom && c.Responsable) {
        knownRespMap.set(getSortedWords(c.Nom), c.Responsable);
        knownRespMap.set(cleanStr(c.Nom), c.Responsable);
      }
    });
  }

  return collabList.map((collab, index) => {
    if (!collab || typeof collab !== 'object') return collab;

    // If already has a Responsable set, preserve it!
    if (collab.Responsable) return collab;

    // First check if a known standard responsable exists for this collaborator
    const cleanName = cleanStr(collab.Nom);
    const sortedName = getSortedWords(collab.Nom);
    let knownResp = knownRespMap.get(sortedName) || knownRespMap.get(cleanName);

    if (!knownResp && Array.isArray(initialCollaborateurs)) {
      for (const initCollab of initialCollaborateurs) {
        if (initCollab && initCollab.Nom && initCollab.Responsable) {
          if (calculateSimilarity(collab.Nom, initCollab.Nom) >= 0.75) {
            knownResp = initCollab.Responsable;
            break;
          }
        }
      }
    }

    if (knownResp) {
      return {
        ...collab,
        Responsable: knownResp
      };
    }

    if (collab.Responsable) return collab;

    // Hash deterministic assignment fallback for custom entries
    const name = collab.Nom || `collab_${index}`;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash << 5) - hash + name.charCodeAt(i);
      hash |= 0;
    }
    const assignedResponsable = DEFAULT_CDZ_RESPONSABLES[Math.abs(hash + index) % DEFAULT_CDZ_RESPONSABLES.length];

    return {
      ...collab,
      Responsable: assignedResponsable
    };
  });
}

/**
 * Extracts unique CDZ and CDA Responsables from collaborateurs list
 */
export function getUniqueCdzCda(collabList = []) {
  const defaultCdzCda = [
    'CHAKIB EL FIL',
    'EL MOSTAFA BOUTMEZGUINE',
    'EL BESTIRI SOUFIANE',
    'MOHAMMED MAAIZ',
    'BENSALEM NOUREDDINE'
  ];

  const fromCollab = collabList
    .filter(c => c.Fonction && (c.Fonction.toUpperCase().includes('CDZ') || c.Fonction.toUpperCase().includes('CDA')))
    .map(c => c.Nom);

  const set = new Set([...defaultCdzCda, ...fromCollab]);
  return Array.from(set).sort();
}



