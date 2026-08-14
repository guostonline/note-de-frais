import { getSql, ensureDatabaseSchema, getConnectionString } from './_db.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!getConnectionString()) {
    return res.status(503).json({
      error: 'DATABASE_NOT_CONFIGURED',
      message: 'Vercel Postgres is not connected. Please connect Postgres in the Vercel Dashboard.'
    });
  }

  try {
    await ensureDatabaseSchema();
    const sql = getSql();

    if (req.method === 'GET') {
      const rows = await sql`
        SELECT 
          id as "id",
          reference as "Reference",
          demandeur as "Demandeur",
          societe as "Societe",
          mois as "Mois",
          semaine as "Semaine",
          date_creation as "DateCreation",
          etat_demande as "EtatDemande",
          url_document as "UrlDocument"
        FROM frais
        ORDER BY id ASC;
      `;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const body = req.body;
      if (!body) {
        return res.status(400).json({ error: 'Request body required' });
      }

      const fraisArray = Array.isArray(body) ? body : [body];
      const isReplace = req.query?.mode === 'replace';

      if (isReplace) {
        await sql`TRUNCATE TABLE frais RESTART IDENTITY;`;
      }

      for (const f of fraisArray) {
        await sql`
          INSERT INTO frais (reference, demandeur, societe, mois, semaine, date_creation, etat_demande, url_document, updated_at)
          VALUES (
            ${f.Reference || ''}, 
            ${f.Demandeur || ''}, 
            ${f.Societe || ''}, 
            ${f.Mois || ''}, 
            ${f.Semaine || ''}, 
            ${f.DateCreation || ''}, 
            ${f.EtatDemande || ''}, 
            ${f.UrlDocument || ''},
            CURRENT_TIMESTAMP
          );
        `;
      }

      return res.status(200).json({ success: true, count: fraisArray.length });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API /api/frais error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
