import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMssqlPool } from '../_lib/mssql.js';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const pool = await getMssqlPool();
    const result = await pool.request().query('SELECT * FROM Equipamentos ORDER BY Nome');
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Erro ao consultar Equipamentos:', error);
    res.status(502).json({ error: 'Falha ao consultar o banco de dados da fazenda (SQL Server)' });
  }
}
