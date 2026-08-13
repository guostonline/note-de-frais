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
 * Seed database with default data if empty
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
 * Fetch all Collaborateurs from IndexedDB
 */
export async function dbGetAllCollaborateurs() {
  return await db.collaborateurs.toArray();
}

/**
 * Save or update a single Collaborateur
 */
export async function dbSaveCollaborateur(collab) {
  return await db.collaborateurs.put(collab);
}

/**
 * Bulk save Collaborateurs
 */
export async function dbSaveCollaborateursBatch(collabArray) {
  await db.collaborateurs.clear();
  return await db.collaborateurs.bulkPut(collabArray);
}

/**
 * Delete a Collaborateur by Nom
 */
export async function dbDeleteCollaborateur(nom) {
  return await db.collaborateurs.delete(nom);
}

/**
 * Fetch all Frais records
 */
export async function dbGetAllFrais() {
  return await db.frais.toArray();
}

/**
 * Save Frais batch
 */
export async function dbSaveFraisBatch(fraisArray) {
  await db.frais.clear();
  return await db.frais.bulkPut(fraisArray);
}

/**
 * Fetch Alias Map
 */
export async function dbGetAliasMap() {
  const entries = await db.aliases.toArray();
  const map = {};
  entries.forEach(e => {
    map[e.demandeur] = e.mappedNom;
  });
  return map;
}

/**
 * Save Alias Map
 */
export async function dbSaveAliasMap(aliasMap) {
  await db.aliases.clear();
  const entries = Object.entries(aliasMap).map(([demandeur, mappedNom]) => ({
    demandeur,
    mappedNom
  }));
  return await db.aliases.bulkPut(entries);
}

/**
 * Reset entire database to initial files
 */
export async function dbResetToDefaults(initialCollabs, initialFraisList, defaultAliases) {
  await db.collaborateurs.clear();
  await db.frais.clear();
  await db.aliases.clear();
  await seedDatabaseIfEmpty(initialCollabs, initialFraisList, defaultAliases);
}
