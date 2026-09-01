import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMssqlPool } from '../_lib/mssql.js';

// Parte de vw_UltimaPosicao (exatamente como o cliente indicou: ORDER BY 2 = CodigoEquipamento),
// enriquecida com:
// - tipo do equipamento (Equipamentos/TiposEquipamento)
// - a leitura mais recente de sensores e de operação por equipamento (LeiturasSensor/LeiturasOperacao,
//   via OUTER APPLY TOP 1) — RpmMedio só existe aqui, não tem como calcular RPM a partir do GPS
// - velocidade média e tempo parado ESTIMADOS a partir do histórico de GPS das últimas 24h
//   (LeiturasLocalizacao), pra quando LeiturasOperacao ainda não tiver dado oficial calculado
//   pelo sistema do cliente
const QUERY = `
WITH LeiturasJanela AS (
  SELECT
    EquipamentoId,
    VelocidadeKmh,
    ColetadoEmUtc,
    LEAD(ColetadoEmUtc) OVER (PARTITION BY EquipamentoId ORDER BY ColetadoEmUtc) AS ProximaColetaUtc
  FROM LeiturasLocalizacao
  WHERE ColetadoEmUtc >= DATEADD(HOUR, -24, SYSUTCDATETIME())
),
ResumoMovimento AS (
  SELECT
    EquipamentoId,
    AVG(CAST(VelocidadeKmh AS FLOAT)) AS VelocidadeMediaCalculadaKmh,
    SUM(CASE
          WHEN VelocidadeKmh IS NOT NULL AND VelocidadeKmh <= 1 AND ProximaColetaUtc IS NOT NULL
          THEN DATEDIFF(SECOND, ColetadoEmUtc, ProximaColetaUtc)
          ELSE 0
        END) AS TempoParadoSegundosCalculado,
    COUNT(*) AS QtdLeiturasJanela
  FROM LeiturasJanela
  GROUP BY EquipamentoId
)
SELECT
  p.*,
  te.Descricao AS TipoEquipamento,
  sens.PorcentagemCargaBateria, sens.TensaoBateria, sens.TemperaturaBateria,
  sens.UmidadeSolo, sens.UmidadeSolo2, sens.UmidadeSolo3,
  sens.Temperatura AS TemperaturaAmbiente,
  sens.EnergiaGeradaDia, sens.EnergiaConsumidaDia, sens.ColetadoEmUtc AS SensorColetadoEmUtc,
  oper.ConsumoMedioLitros, oper.VelocidadeMedia AS VelocidadeMediaOperacao, oper.RpmMedio,
  oper.TempoMotorLigadoSegundos, oper.TempoMotorOciosoSegundos, oper.AreaOperacional,
  oper.ColetadoEmUtc AS OperacaoColetadoEmUtc,
  rm.VelocidadeMediaCalculadaKmh, rm.TempoParadoSegundosCalculado, rm.QtdLeiturasJanela
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
LEFT JOIN ResumoMovimento rm ON rm.EquipamentoId = p.EquipamentoId
ORDER BY p.CodigoEquipamento
`;

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const pool = await getMssqlPool();
    const result = await pool.request().query(QUERY);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Erro ao consultar posições enriquecidas:', error);
    res.status(502).json({ error: 'Falha ao consultar o banco de dados da fazenda (SQL Server)' });
  }
}
