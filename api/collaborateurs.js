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
          matricule as "Matricule",
          nom as "Nom",
          entite as "Entite",
          fonction as "Fonction",
          responsable as "Responsable"
        FROM collaborateurs
        ORDER BY nom ASC;
      `;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const body = req.body;
      if (!body) {
        return res.status(400).json({ error: 'Request body required' });
      }

      // Check if batch replace or bulk update
      if (Array.isArray(body)) {
        // Bulk replace/upsert
        for (const c of body) {
          const mat = Number(c.Matricule) || 0;
          await sql`
            INSERT INTO collaborateurs (matricule, nom, entite, fonction, responsable, updated_at)
            VALUES (${mat}, ${c.Nom || ''}, ${c.Entite || ''}, ${c.Fonction || ''}, ${c.Responsable || ''}, CURRENT_TIMESTAMP)
            ON CONFLICT (matricule) DO UPDATE SET
              nom = EXCLUDED.nom,
              entite = EXCLUDED.entite,
              fonction = EXCLUDED.fonction,
              responsable = EXCLUDED.responsable,
              updated_at = CURRENT_TIMESTAMP;
          `;
        }
        return res.status(200).json({ success: true, count: body.length });
      } else {
        // Single upsert
        const mat = Number(body.Matricule) || 0;
        await sql`
          INSERT INTO collaborateurs (matricule, nom, entite, fonction, responsable, updated_at)
          VALUES (${mat}, ${body.Nom || ''}, ${body.Entite || ''}, ${body.Fonction || ''}, ${body.Responsable || ''}, CURRENT_TIMESTAMP)
          ON CONFLICT (matricule) DO UPDATE SET
            nom = EXCLUDED.nom,
            entite = EXCLUDED.entite,
            fonction = EXCLUDED.fonction,
            responsable = EXCLUDED.responsable,
            updated_at = CURRENT_TIMESTAMP;
        `;
        return res.status(200).json({ success: true, data: body });
      }
    }

    if (req.method === 'DELETE') {
      const matricule = req.query?.matricule || req.body?.matricule || req.body?.Matricule;
      const nom = req.query?.nom || req.body?.nom || req.body?.Nom;

      if (matricule) {
        await sql`DELETE FROM collaborateurs WHERE matricule = ${Number(matricule)}`;
      } else if (nom) {
        await sql`DELETE FROM collaborateurs WHERE nom = ${nom}`;
      } else {
        return res.status(400).json({ error: 'Missing matricule or nom parameter' });
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API /api/collaborateurs error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
