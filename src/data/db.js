import Dexie from 'dexie';

// Initialize fast IndexedDB database instance via Dexie
export const db = new Dexie('NoteDeFraisDB');

// Define tables schema & indexes for ultra-fast queries
db.version(1).stores({
  collaborateurs: 'Nom, Matricule, Entite, Fonction, Responsable',
  frais: '++id, Reference, Demandeur, Mois, Semaine, Societe',
  aliases: 'demandeur, mappedNom',
  settings: 'key'
});

/**
 * Helper to perform API requests with timeout
 */
async function apiRequest(endpoint, options = {}, timeoutMs = 6000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    // Silent fail for network/offline, fallback to Dexie
    return null;
  }
}

/**
 * Check if the cloud database is reachable and active
 */
export async function checkCloudDatabaseStatus() {
  const result = await apiRequest('/api/status', { method: 'GET' }, 4000);
  return result && result.status === 'connected';
}

/**
 * Seed local database with default data if empty
 */
export async function seedDatabaseIfEmpty(initialCollabs = [], initialFraisList = [], defaultAliases = {}) {
  try {
    const collabCount = await db.collaborateurs.count();
    if (collabCount === 0 && initialCollabs.length > 0) {
      await db.collaborateurs.bulkPut(initialCollabs);
    }

    const fraisCount = await db.frais.count();
    if (fraisCount === 0 && initialFraisList.length > 0) {
      await db.frais.bulkPut(initialFraisList);
    }

    const aliasCount = await db.aliases.count();
    if (aliasCount === 0 && Object.keys(defaultAliases).length > 0) {
      const aliasEntries = Object.entries(defaultAliases).map(([demandeur, mappedNom]) => ({
        demandeur,
        mappedNom
      }));
      await db.aliases.bulkPut(aliasEntries);
    }
  } catch (err) {
    console.error('Error seeding IndexedDB database:', err);
  }
}

/**
 * Fetch all Collaborateurs (Cloud first with Dexie fallback)
 */
export async function dbGetAllCollaborateurs() {
  const cloudData = await apiRequest('/api/collaborateurs');
  if (Array.isArray(cloudData) && cloudData.length > 0) {
    // Sync to local Dexie cache
    try {
      await db.collaborateurs.clear();
      await db.collaborateurs.bulkPut(cloudData);
    } catch (e) {}
    return cloudData;
  }
  return await db.collaborateurs.toArray();
}

/**
 * Save or update a single Collaborateur (Sync to Cloud + Dexie)
 */
export async function dbSaveCollaborateur(collab) {
  // 1. Update local cache immediately
  await db.collaborateurs.put(collab);

  // 2. Sync to Cloud API in background
  apiRequest('/api/collaborateurs', {
    method: 'POST',
    body: JSON.stringify(collab)
  }).catch(() => {});

  return collab;
}

/**
 * Bulk save Collaborateurs (Sync to Cloud + Dexie)
 */
export async function dbSaveCollaborateursBatch(collabArray) {
  // 1. Update local cache
  await db.collaborateurs.clear();
  await db.collaborateurs.bulkPut(collabArray);

  // 2. Sync to Cloud API
  await apiRequest('/api/collaborateurs', {
    method: 'POST',
    body: JSON.stringify(collabArray)
  });

  return collabArray;
}

/**
 * Delete a Collaborateur by Nom or Matricule (Sync to Cloud + Dexie)
 */
export async function dbDeleteCollaborateur(nom, matricule) {
  // 1. Delete from local cache
  await db.collaborateurs.delete(nom);

  // 2. Sync deletion to Cloud API
  const query = matricule ? `matricule=${encodeURIComponent(matricule)}` : `nom=${encodeURIComponent(nom)}`;
  await apiRequest(`/api/collaborateurs?${query}`, {
    method: 'DELETE'
  });
}

/**
 * Fetch all Frais records (Cloud first with Dexie fallback)
 */
export async function dbGetAllFrais() {
  const cloudData = await apiRequest('/api/frais');
  if (Array.isArray(cloudData) && cloudData.length > 0) {
    try {
      await db.frais.clear();
      await db.frais.bulkPut(cloudData);
    } catch (e) {}
    return cloudData;
  }
  return await db.frais.toArray();
}

/**
 * Save Frais batch (Sync to Cloud + Dexie)
 */
export async function dbSaveFraisBatch(fraisArray) {
  // 1. Update local cache
  await db.frais.clear();
  await db.frais.bulkPut(fraisArray);

  // 2. Sync to Cloud API with replace mode
  await apiRequest('/api/frais?mode=replace', {
    method: 'POST',
    body: JSON.stringify(fraisArray)
  });

  return fraisArray;
}

/**
 * Fetch Alias Map (Cloud first with Dexie fallback)
 */
export async function dbGetAliasMap() {
  const cloudMap = await apiRequest('/api/aliases');
  if (cloudMap && typeof cloudMap === 'object' && Object.keys(cloudMap).length > 0) {
    try {
      await db.aliases.clear();
      const entries = Object.entries(cloudMap).map(([demandeur, mappedNom]) => ({
        demandeur,
        mappedNom
      }));
      await db.aliases.bulkPut(entries);
    } catch (e) {}
    return cloudMap;
  }

  const entries = await db.aliases.toArray();
  const map = {};
  entries.forEach(e => {
    map[e.demandeur] = e.mappedNom;
  });
  return map;
}

/**
 * Save Alias Map (Sync to Cloud + Dexie)
 */
export async function dbSaveAliasMap(aliasMap) {
  await db.aliases.clear();
  const entries = Object.entries(aliasMap).map(([demandeur, mappedNom]) => ({
    demandeur,
    mappedNom
  }));
  await db.aliases.bulkPut(entries);

  await apiRequest('/api/aliases', {
    method: 'POST',
    body: JSON.stringify(aliasMap)
  });

  return aliasMap;
}

/**
 * Reset entire database to initial files
 */
export async function dbResetToDefaults(initialCollabs, initialFraisList, defaultAliases) {
  await db.collaborateurs.clear();
  await db.frais.clear();
  await db.aliases.clear();
  await seedDatabaseIfEmpty(initialCollabs, initialFraisList, defaultAliases);

  // Sync reset to cloud if connected
  try {
    await apiRequest('/api/collaborateurs', {
      method: 'POST',
      body: JSON.stringify(initialCollabs)
    });
    await apiRequest('/api/frais?mode=replace', {
      method: 'POST',
      body: JSON.stringify(initialFraisList)
    });
    await apiRequest('/api/aliases', {
      method: 'POST',
      body: JSON.stringify(defaultAliases)
    });
  } catch (e) {}
}
