import { getSql, ensureDatabaseSchema, getConnectionString } from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const isConfigured = !!getConnectionString();

  if (!isConfigured) {
    return res.status(200).json({
      status: 'offline_local_only',
      database: 'none',
      message: 'Vercel Postgres is not connected. App is operating in browser-local Dexie mode.'
    });
  }

  try {
    await ensureDatabaseSchema();
    const sql = getSql();
    const [{ count: collabs }] = await sql`SELECT COUNT(*)::int as count FROM collaborateurs`;
    const [{ count: frais }] = await sql`SELECT COUNT(*)::int as count FROM frais`;
    const [{ count: aliases }] = await sql`SELECT COUNT(*)::int as count FROM aliases`;

    return res.status(200).json({
      status: 'connected',
      database: 'Vercel Postgres (Neon)',
      counts: {
        collaborateurs: collabs,
        frais: frais,
        aliases: aliases
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}
