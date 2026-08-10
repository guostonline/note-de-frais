/**
 * Intelligent Name Matching and Analysis Engine
 */

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

  const tokens1 = new Set(n1.split(' '));
  const tokens2 = new Set(n2.split(' '));

  let matchedTokens = 0;
  tokens1.forEach(t1 => {
    if (!t1) return;
    tokens2.forEach(t2 => {
      if (!t2) return;
      if (t1 === t2) {
        matchedTokens += 1;
      } else if (t1.length > 3 && t2.length > 3 && (t1.includes(t2) || t2.includes(t1))) {
        matchedTokens += 0.8;
      }
    });
  });

  const tokenScore = (2 * matchedTokens) / (tokens1.size + tokens2.size);
  return tokenScore;
}

/**
 * Finds best collaborator match for a given Frais demandeur
 */
export function matchDemandeurToCollaborateur(demandeurName, colaboradoresList, aliasMap = {}) {
  if (!demandeurName) return { collaborateur: null, score: 0, isAlias: false };

  // 1. Check user custom manual alias mapping
  if (aliasMap[demandeurName]) {
    const matchedCollab = colaboradoresList.find(c => c.Nom === aliasMap[demandeurName]);
    if (matchedCollab) {
      return { collaborateur: matchedCollab, score: 1.0, isAlias: true };
    }
  }

  // 2. Direct exact or sorted word match
  const sortedDemandeur = getSortedWords(demandeurName);
  for (const collab of colaboradoresList) {
    if (getSortedWords(collab.Nom) === sortedDemandeur) {
      return { collaborateur: collab, score: 1.0, isAlias: false };
    }
  }

  // 3. Fuzzy search for best candidate
  let bestCollab = null;
  let maxScore = 0;

  for (const collab of colaboradoresList) {
    const score = calculateSimilarity(demandeurName, collab.Nom);
    if (score > maxScore) {
      maxScore = score;
      bestCollab = collab;
    }
  }

  return {
    collaborateur: maxScore >= 0.6 ? bestCollab : null,
    score: maxScore,
    isAlias: false
  };
}

/**
 * Normalizes Frais objects array from Excel uploads
 */
export function normalizeFraisData(fraisArray = []) {
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

    const demandeurVal = item[demandeurKey] !== undefined ? String(item[demandeurKey]).trim() : (item.Demandeur || '');
    const moisVal = item[moisKey] !== undefined ? String(item[moisKey]).trim() : (item.Mois || '');
    const semaineVal = item[semaineKey] !== undefined ? String(item[semaineKey]).trim() : (item.Semaine || '');
    const refVal = item[refKey] !== undefined ? String(item[refKey]).trim() : (item.Reference || '');
    const socVal = item[socKey] !== undefined ? String(item[socKey]).trim() : (item.Societe || '');

    return {
      ...item,
      id: item.id || index + 1,
      Demandeur: demandeurVal,
      Mois: moisVal,
      Semaine: semaineVal,
      Reference: refVal,
      Societe: socVal
    };
  });
}

/**
 * Builds a map of Collaborateur Nom -> Array of submitted Frais records for a filtered period
 */
export function buildSubmissionMap(collabList, fraisList, monthFilter = 'ALL', weekFilter = 'ALL', aliasMap = {}) {
  // Filter frais by period (supporting string 'ALL', empty array [], or multi-select array)
  const filteredFrais = (fraisList || []).filter(item => {
    // Month filter check
    let matchMonth = true;
    if (Array.isArray(monthFilter)) {
      if (monthFilter.length > 0 && !monthFilter.includes('ALL')) {
        matchMonth = monthFilter.includes(item.Mois);
      }
    } else if (monthFilter !== 'ALL' && monthFilter !== '') {
      matchMonth = item.Mois === monthFilter;
    }

    // Week filter check
    let matchWeek = true;
    if (Array.isArray(weekFilter)) {
      if (weekFilter.length > 0 && !weekFilter.includes('ALL')) {
        matchWeek = weekFilter.includes(item.Semaine);
      }
    } else if (weekFilter !== 'ALL' && weekFilter !== '') {
      matchWeek = item.Semaine === weekFilter;
    }

    return matchMonth && matchWeek;
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
 * Extracts unique months from frais list in order
 */
export function getUniqueMonths(fraisList = []) {
  const monthOrder = ['Mai', 'Juin', 'Juillet', 'Août', 'Aot', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const set = new Set((fraisList || []).map(f => f.Mois).filter(Boolean));
  return monthOrder.filter(m => set.has(m) || set.has(m.replace('û', '')));
}

/**
 * Extracts unique weeks from frais list for a specific month
 */
export function getUniqueWeeks(fraisList = [], month = 'ALL') {
  let list = fraisList || [];
  if (Array.isArray(month)) {
    if (month.length > 0 && !month.includes('ALL')) {
      list = list.filter(f => month.includes(f.Mois));
    }
  } else if (month !== 'ALL' && month !== '') {
    list = list.filter(f => f.Mois === month);
  }
  const weeks = Array.from(new Set(list.map(f => f.Semaine).filter(Boolean)));
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
  return collabList.map((collab, index) => {
    if (!collab || typeof collab !== 'object') return collab;
    if (collab.Responsable) return collab;

    // Hash deterministic assignment fallback
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



