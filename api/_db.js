import { neon } from '@neondatabase/serverless';
import { initialCollaborateurs, initialFrais } from '../src/data/defaultData.js';

const defaultAliasMap = {
  "CHAKIB ELFIL": "CHAKIB EL FIL",
  "BOUTMEZGUINE EL MOSTAFA": "EL MOSTAFA BOUTMEZGUINE",
  "NOUREDDINE BEN SALEM": "BENSALEM NOUREDDINE",
  "EL HACHEM BENGAIOU": "EL GHANMI MOHAMED"
};

export function getConnectionString() {
  return (
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    ''
  );
}

export function getSql() {
  const connectionString = getConnectionString();
  if (!connectionString) {
    throw new Error('Database connection string not found. Please connect Vercel Postgres / Neon database in Vercel settings.');
  }
  return neon(connectionString);
}

let isInitialized = false;

/**
 * Initializes database schema and seeds initial data if empty.
 */
export async function ensureDatabaseSchema() {
  if (isInitialized) return;
  const sql = getSql();

  // Create tables
  await sql`
    CREATE TABLE IF NOT EXISTS collaborateurs (
      matricule BIGINT PRIMARY KEY,
      nom TEXT NOT NULL,
      entite TEXT,
      fonction TEXT,
      responsable TEXT,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS frais (
      id SERIAL PRIMARY KEY,
      reference TEXT,
      demandeur TEXT,
      societe TEXT,
      mois TEXT,
      semaine TEXT,
      date_creation TEXT,
      etat_demande TEXT,
      url_document TEXT,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS aliases (
      demandeur TEXT PRIMARY KEY,
      mapped_nom TEXT NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Check and seed collaborateurs
  const [{ count: collabCount }] = await sql`SELECT COUNT(*)::int as count FROM collaborateurs`;
  if (collabCount === 0 && initialCollaborateurs && initialCollaborateurs.length > 0) {
    for (const c of initialCollaborateurs) {
      await sql`
        INSERT INTO collaborateurs (matricule, nom, entite, fonction, responsable)
        VALUES (${Number(c.Matricule) || 0}, ${c.Nom || ''}, ${c.Entite || ''}, ${c.Fonction || ''}, ${c.Responsable || ''})
        ON CONFLICT (matricule) DO UPDATE SET
          nom = EXCLUDED.nom,
          entite = EXCLUDED.entite,
          fonction = EXCLUDED.fonction,
          responsable = EXCLUDED.responsable;
      `;
    }
  }

  // Check and seed frais
  const [{ count: fraisCount }] = await sql`SELECT COUNT(*)::int as count FROM frais`;
  if (fraisCount === 0 && initialFrais && initialFrais.length > 0) {
    for (const f of initialFrais) {
      await sql`
        INSERT INTO frais (reference, demandeur, societe, mois, semaine, date_creation, etat_demande, url_document)
        VALUES (
          ${f.Reference || ''}, 
          ${f.Demandeur || ''}, 
          ${f.Societe || ''}, 
          ${f.Mois || ''}, 
          ${f.Semaine || ''}, 
          ${f.DateCreation || ''}, 
          ${f.EtatDemande || ''}, 
          ${f.UrlDocument || ''}
        );
      `;
    }
  }

  // Check and seed aliases
  const [{ count: aliasCount }] = await sql`SELECT COUNT(*)::int as count FROM aliases`;
  if (aliasCount === 0) {
    for (const [demandeur, mappedNom] of Object.entries(defaultAliasMap)) {
      await sql`
        INSERT INTO aliases (demandeur, mapped_nom)
        VALUES (${demandeur}, ${mappedNom})
        ON CONFLICT (demandeur) DO UPDATE SET mapped_nom = EXCLUDED.mapped_nom;
      `;
    }
  }

  isInitialized = true;
}
