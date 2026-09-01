import { Router } from 'express';
import { getMssqlPool } from '../lib/mssql.js';

const router = Router();

// Parte de vw_UltimaPosicao (exatamente como o cliente indicou: ORDER BY 2 = CodigoEquipamento),
// enriquecida com o tipo do equipamento e a leitura mais recente de sensores e de operação
// de cada equipamento (LeiturasSensor e LeiturasOperacao), via OUTER APPLY TOP 1.
const POSICOES_QUERY = `
SELECT
  p.EquipamentoId, p.CodigoEquipamento, p.Nome, p.GrupoFrente, p.Fazenda,
  p.Latitude, p.Longitude, p.VelocidadeKmh, p.DirecaoGraus, p.Estado,
  p.OperacaoDescricao, p.Operador, p.CodigoTalhao, p.DataHoraOperacao,
  p.ColetadoEm, p.MinutosSemComunicacao,
  te.Descricao AS TipoEquipamento,
  sens.PorcentagemCargaBateria, sens.TensaoBateria, sens.TemperaturaBateria,
  sens.UmidadeSolo, sens.UmidadeSolo2, sens.UmidadeSolo3,
  sens.Temperatura AS TemperaturaAmbiente,
  sens.EnergiaGeradaDia, sens.EnergiaConsumidaDia, sens.ColetadoEmUtc AS SensorColetadoEmUtc,
  oper.ConsumoMedioLitros, oper.VelocidadeMedia AS VelocidadeMediaOperacao, oper.RpmMedio,
  oper.TempoMotorLigadoSegundos, oper.TempoMotorOciosoSegundos, oper.AreaOperacional,
  oper.ColetadoEmUtc AS OperacaoColetadoEmUtc
FROM vw_UltimaPosicao p
LEFT JOIN Equipamentos eq ON eq.EquipamentoId = p.EquipamentoId
LEFT JOIN TiposEquipamento te ON te.TipoEquipamentoId = eq.TipoEquipamentoId
OUTER APPLY (
  SELECT TOP 1 ls.*
  FROM LeiturasSensor ls
  WHERE ls.EquipamentoId = p.EquipamentoId
  ORDER BY ls.ColetadoEmUtc DESC
) sens
OUTER APPLY (
  SELECT TOP 1 lo.*
  FROM LeiturasOperacao lo
  WHERE lo.EquipamentoId = p.EquipamentoId
  ORDER BY lo.ColetadoEmUtc DESC
) oper
ORDER BY p.CodigoEquipamento
`;

router.get('/posicoes', async (_req, res) => {
  try {
    const pool = await getMssqlPool();
    const result = await pool.request().query(POSICOES_QUERY);
    res.json(result.recordset);
  } catch (error) {
    console.error('Erro ao consultar posições enriquecidas:', error);
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
