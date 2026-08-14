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
        SELECT demandeur, mapped_nom
        FROM aliases
        ORDER BY demandeur ASC;
      `;
      const map = {};
      rows.forEach(r => {
        map[r.demandeur] = r.mapped_nom;
      });
      return res.status(200).json(map);
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const body = req.body;
      if (!body || typeof body !== 'object') {
        return res.status(400).json({ error: 'Valid alias map object required' });
      }

      for (const [demandeur, mappedNom] of Object.entries(body)) {
        await sql`
          INSERT INTO aliases (demandeur, mapped_nom, updated_at)
          VALUES (${demandeur}, ${mappedNom}, CURRENT_TIMESTAMP)
          ON CONFLICT (demandeur) DO UPDATE SET
            mapped_nom = EXCLUDED.mapped_nom,
            updated_at = CURRENT_TIMESTAMP;
        `;
      }

      return res.status(200).json({ success: true, count: Object.keys(body).length });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API /api/aliases error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
