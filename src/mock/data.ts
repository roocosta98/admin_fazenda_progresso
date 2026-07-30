import type { Usuario, Projeto, Veiculo, Motorista, SolicitacaoTransporte } from '../types';

export const MOCK_USUARIOS: Usuario[] = [
  { id: '1', idSankhya: 'S-1001', nome: 'João - Técnico de Campo', perfil: 'solicitante', departamento: 'Agrícola' },
  { id: '2', idSankhya: 'S-1002', nome: 'Carlos - Gestor de Frota', perfil: 'logistica', departamento: 'Logística' },
  { id: '3', idSankhya: 'S-1003', nome: 'Antônio - Motorista', perfil: 'motorista', departamento: 'Frota' },
];

export const MOCK_PROJETOS: Projeto[] = [
  { id: 'P-001', nome: 'PRODUÇÃO DE BATATA FCB 2026', centroCusto: 'CC-BATATA-26' },
  { id: 'P-002', nome: 'SAFRA SOJA LESTE 2026', centroCusto: 'CC-SOJA-L-26' },
  { id: 'P-003', nome: 'INFRAESTRUTURA E MANUTENÇÃO', centroCusto: 'CC-INFRA' },
];

export const MOCK_VEICULOS: Veiculo[] = [
  { id: 'V-001', placa: 'ABC-1234', modelo: 'Volvo FH 540', tipo: 'Prancha', status: 'disponivel' },
  { id: 'V-002', placa: 'DEF-5678', modelo: 'Mercedes-Benz Atego', tipo: 'Comboio', status: 'em_uso' },
  { id: 'V-003', placa: 'GHI-9012', modelo: 'Fiat Strada', tipo: 'Carro Passeio', status: 'disponivel' },
  { id: 'V-004', placa: 'JKL-3456', modelo: 'Agrale Marruá', tipo: 'Ônibus', status: 'manutencao' },
  { id: 'V-005', placa: 'MNO-7890', modelo: 'John Deere 8R', tipo: 'Trator', status: 'disponivel' },
  { id: 'V-006', placa: 'PQR-1234', modelo: 'Scania R500', tipo: 'Caçamba', status: 'disponivel' },
];

export const MOCK_MOTORISTAS: Motorista[] = [
  { id: 'M-001', nome: 'Antônio Silva', telefone: '(61) 99999-1111', status: 'disponivel' },
  { id: 'M-002', nome: 'Pedro Santos', telefone: '(61) 99999-2222', status: 'em_rota' },
  { id: 'M-003', nome: 'José Oliveira', telefone: '(61) 99999-3333', status: 'folga' },
  { id: 'M-004', nome: 'Marcos Costa', telefone: '(61) 99999-4444', status: 'disponivel' },
];

export const MOCK_SOLICITACOES: SolicitacaoTransporte[] = [
  {
    id: 'SOL-001',
    numeroOS: 'OS-2026-0001',
    solicitante: MOCK_USUARIOS[0],
    tipoServico: 'Carro Passeio',
    origem: 'Sedes',
    destino: 'Lote 12',
    dataSolicitacao: '2026-07-28T08:00:00Z',
    dataProgramada: '2026-07-30',
    horarioProgramado: '09:00',
    projeto: MOCK_PROJETOS[0],
    observacoes: 'Visita técnica ao lote 12',
    status: 'concluida',
    veiculoAlocado: MOCK_VEICULOS[2],
    motoristaAlocado: MOCK_MOTORISTAS[0],
    dadosExecucao: {
      kmInicial: 12500,
      kmFinal: 12540,
      dataHoraSaida: '2026-07-30T09:05:00Z',
      dataHoraChegada: '2026-07-30T14:30:00Z'
    }
  },
  {
    id: 'SOL-002',
    numeroOS: 'OS-2026-0002',
    solicitante: MOCK_USUARIOS[0],
    tipoServico: 'Prancha',
    origem: 'Galpão de Insumos',
    destino: 'Campo de Batata',
    dataSolicitacao: '2026-07-29T10:15:00Z',
    dataProgramada: '2026-07-31',
    horarioProgramado: '14:00',
    projeto: MOCK_PROJETOS[0],
    observacoes: 'Transporte de colheitadeira',
    status: 'agendada',
    veiculoAlocado: MOCK_VEICULOS[0],
    motoristaAlocado: MOCK_MOTORISTAS[3]
  },
  {
    id: 'SOL-003',
    numeroOS: 'OS-2026-0003',
    solicitante: MOCK_USUARIOS[0],
    tipoServico: 'Comboio',
    origem: 'Sedes',
    destino: 'Safra Leste',
    dataSolicitacao: '2026-07-30T07:30:00Z',
    dataProgramada: '2026-07-30',
    horarioProgramado: '10:00',
    projeto: MOCK_PROJETOS[1],
    observacoes: 'Abastecimento das máquinas no campo',
    status: 'em_execucao',
    veiculoAlocado: MOCK_VEICULOS[1],
    motoristaAlocado: MOCK_MOTORISTAS[1],
    dadosExecucao: {
      kmInicial: 45200,
      dataHoraSaida: '2026-07-30T10:10:00Z'
    }
  },
  {
    id: 'SOL-004',
    numeroOS: 'OS-2026-0004',
    solicitante: MOCK_USUARIOS[0],
    tipoServico: 'Trator',
    origem: 'Oficina Central',
    destino: 'Lote 15',
    dataSolicitacao: '2026-07-30T11:45:00Z',
    dataProgramada: '2026-08-01',
    horarioProgramado: '07:00',
    projeto: MOCK_PROJETOS[2],
    status: 'pendente'
  },
  {
    id: 'SOL-005',
    numeroOS: 'OS-2026-0005',
    solicitante: MOCK_USUARIOS[0],
    tipoServico: 'Ônibus',
    origem: 'Sedes',
    destino: 'Lote 12',
    dataSolicitacao: '2026-07-25T16:20:00Z',
    dataProgramada: '2026-07-26',
    horarioProgramado: '06:00',
    projeto: MOCK_PROJETOS[0],
    status: 'cancelada',
    motivoCancelamento: 'Chuva forte, impossível acessar o lote'
  },
  {
    id: 'SOL-006',
    numeroOS: 'OS-2026-0006',
    solicitante: MOCK_USUARIOS[0],
    tipoServico: 'Caçamba',
    origem: 'Pedreira',
    destino: 'Estrada Sul',
    dataSolicitacao: '2026-07-30T12:00:00Z',
    dataProgramada: '2026-08-02',
    horarioProgramado: '08:00',
    projeto: MOCK_PROJETOS[2],
    status: 'pendente'
  }
];
