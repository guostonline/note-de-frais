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
 * Builds a map of Collaborateur Nom -> Array of submitted Frais records for a filtered period
 */
export function buildSubmissionMap(collabList, fraisList, monthFilter = 'ALL', weekFilter = 'ALL', aliasMap = {}) {
  // Filter frais by period
  const filteredFrais = fraisList.filter(item => {
    const matchMonth = monthFilter === 'ALL' || item.Mois === monthFilter;
    const matchWeek = weekFilter === 'ALL' || item.Semaine === weekFilter;
    return matchMonth && matchWeek;
  });

  // Map each collaborator
  const map = {};
  collabList.forEach(collab => {
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
export function getUniqueMonths(fraisList) {
  const monthOrder = ['Mai', 'Juin', 'Juillet', 'Août', 'Aot', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const set = new Set(fraisList.map(f => f.Mois).filter(Boolean));
  return monthOrder.filter(m => set.has(m) || set.has(m.replace('û', '')));
}

/**
 * Extracts unique weeks from frais list for a specific month
 */
export function getUniqueWeeks(fraisList, month = 'ALL') {
  let list = fraisList;
  if (month !== 'ALL') {
    list = fraisList.filter(f => f.Mois === month);
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



