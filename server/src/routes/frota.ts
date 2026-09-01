import { Router } from 'express';
import { getMssqlPool } from '../lib/mssql.js';

const router = Router();

// Espelha exatamente o retorno indicado pelo cliente: SELECT * FROM vw_UltimaPosicao ORDER BY 2
router.get('/posicoes', async (_req, res) => {
  try {
    const pool = await getMssqlPool();
    const result = await pool.request().query('SELECT * FROM vw_UltimaPosicao ORDER BY 2');
    res.json(result.recordset);
  } catch (error) {
    console.error('Erro ao consultar vw_UltimaPosicao:', error);
    res.status(502).json({ error: 'Falha ao consultar o banco de dados da fazenda (SQL Server)' });
  }
});

router.get('/equipamentos', async (_req, res) => {
  try {
    const pool = await getMssqlPool();
    const result = await pool.request().query('SELECT * FROM Equipamentos ORDER BY Nome');
    res.json(result.recordset);
  } catch (error) {
    console.error('Erro ao consultar Equipamentos:', error);
    res.status(502).json({ error: 'Falha ao consultar o banco de dados da fazenda (SQL Server)' });
  }
});

export default router;
