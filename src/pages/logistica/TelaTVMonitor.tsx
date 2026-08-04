import { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  Truck, 
  Clock, 
  Sun, 
  Moon, 
  Maximize2, 
  Minimize2, 
  Play, 
  Pause,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Activity,
  CheckCircle2,
  MapPin,
  User,
  Radio,
  Eye,
  EyeOff
} from 'lucide-react';

interface TVOSItem {
  id: string;
  numeroOS: string;
  statusTexto: string;
  statusTipo: 'em_execucao' | 'agendado' | 'concluido' | 'alerta';
  tipoServico: string;
  veiculoModelo: string;
  veiculoPlaca: string;
  motorista: string;
  solicitante: string;
  prioridade: 'Média' | 'Alta' | 'Urgente' | 'Normal';
  origem: string;
  destino: string;
  horario: string;
  velocidade: number;
  ultimoRastreio: string;
}

const DEMO_OS_LIST: TVOSItem[] = [
  {
    id: 'SOL-6548',
    numeroOS: 'OS-2026-0001',
    statusTexto: 'Em Execução',
    statusTipo: 'em_execucao',
    tipoServico: '19513 - TRANSPORTE DE ADUBO / INSUMOS',
    veiculoModelo: 'ONIBUS M.BENZ 1318',
    veiculoPlaca: 'BXE-7320',
    motorista: 'Antônio Silva',
    solicitante: 'João - Técnico de Campo',
    prioridade: 'Média',
    origem: 'Galpão Insumos',
    destino: 'Pivô 04',
    horario: '08:30',
    velocidade: 45,
    ultimoRastreio: '15:59:10 (há 20 seg)'
  },
  {
    id: 'SOL-6549',
    numeroOS: 'OS-2026-0002',
    statusTexto: 'Em Execução',
    statusTipo: 'em_execucao',
    tipoServico: '19516 - TRANSPORTE DE FUNCIONÁRIOS',
    veiculoModelo: 'CAÇAMBA M.BENZ 1513',
    veiculoPlaca: 'CXU-6289',
    motorista: 'Pedro Santos',
    solicitante: 'Carlos - Gestor de Frota',
    prioridade: 'Média',
    origem: 'Alojamento Central',
    destino: 'Pivô 08',
    horario: '09:00',
    velocidade: 0,
    ultimoRastreio: '15:58:42 (há 50 seg)'
  },
  {
    id: 'SOL-6546',
    numeroOS: 'OS-2026-0003',
    statusTexto: 'Em Execução',
    statusTipo: 'em_execucao',
    tipoServico: '19517 - TRANSPORTE DE MÁQUINAS E EQUIPAMENTOS',
    veiculoModelo: 'ONIBUS M.BENZ 1620',
    veiculoPlaca: 'ICM-1818',
    motorista: 'José Oliveira',
    solicitante: 'Ismael do Nascimento',
    prioridade: 'Alta',
    origem: 'Oficina Central',
    destino: 'Talhão 05',
    horario: '09:15',
    velocidade: 52,
    ultimoRastreio: '15:59:25 (há 5 seg)'
  },
  {
    id: 'SOL-6529',
    numeroOS: 'OS-2026-0004',
    statusTexto: 'Em Execução',
    statusTipo: 'em_execucao',
    tipoServico: '19514 - TRANSPORTE DE GRÃOS / COLHEITA',
    veiculoModelo: 'CAMINHAO M.BENZ 1313',
    veiculoPlaca: 'IEU-7100',
    motorista: 'Marcos Costa',
    solicitante: 'Éder Ferreira Caires',
    prioridade: 'Média',
    origem: 'Campo de Batata',
    destino: 'Silomax Sede',
    horario: '09:30',
    velocidade: 64,
    ultimoRastreio: '15:57:10 (há 2 min)'
  },
  {
    id: 'SOL-6530',
    numeroOS: 'OS-2026-0005',
    veiculoModelo: 'CAVALO MECANICO M.BENZ LS 1935',
    veiculoPlaca: 'ICY-0877',
    statusTexto: 'Em Execução',
    statusTipo: 'em_execucao',
    tipoServico: '19511 - TRANSPORTE DE ÁGUA / IRRIGACÃO',
    motorista: 'Raimundo Nonato',
    solicitante: 'Edson Silva',
    prioridade: 'Média',
    origem: 'Açude Principal',
    destino: 'Pivô 03',
    horario: '10:00',
    velocidade: 38,
    ultimoRastreio: '15:59:00 (há 30 seg)'
  },
  {
    id: 'SOL-6493',
    numeroOS: 'OS-2026-0006',
    veiculoModelo: 'TOYOTA HILUX 4X4',
    veiculoPlaca: 'JKL-9012',
    statusTexto: 'Em Execução',
    statusTipo: 'em_execucao',
    tipoServico: '19515 - SOCORRO MECÂNICO / COMBOIO',
    motorista: 'João - Técnico de Campo',
    solicitante: 'Ana Valéria Cardoso',
    prioridade: 'Alta',
    origem: 'Base de Operações',
    destino: 'Setor Leste',
    horario: '10:15',
    velocidade: 58,
    ultimoRastreio: '15:58:55 (há 35 seg)'
  },
  {
    id: 'SOL-6480',
    numeroOS: 'OS-2026-0007',
    veiculoModelo: 'TRATOR JOHN DEERE 8335R',
    veiculoPlaca: 'MNO-3456',
    statusTexto: 'Em Execução',
    statusTipo: 'em_execucao',
    tipoServico: '19510 - TRANSPORTE BATATA SEMENTE',
    motorista: 'Carlos Eduardo',
    solicitante: 'Éder Ferreira Caires',
    prioridade: 'Urgente',
    origem: 'Beneficiamento',
    destino: 'Lote 01',
    horario: '10:30',
    velocidade: 14,
    ultimoRastreio: '15:58:15 (há 1 min)'
  },
  {
    id: 'SOL-6475',
    numeroOS: 'OS-2026-0008',
    veiculoModelo: 'COMBOIO MERCEDES BENZ 2726',
    veiculoPlaca: 'PQR-7890',
    statusTexto: 'Agendado',
    statusTipo: 'agendado',
    tipoServico: '19495 - SERVIÇO DE SILAGEM',
    motorista: 'Fernando Ramos',
    solicitante: 'Roberto Lima',
    prioridade: 'Média',
    origem: 'Sede',
    destino: 'Silo Norte',
    horario: '11:00',
    velocidade: 0,
    ultimoRastreio: '15:50:00 (há 9 min)'
  },
  {
    id: 'SOL-6471',
    numeroOS: 'OS-2026-0009',
    veiculoModelo: 'PRANCHA 3 EIXOS HEAVY DUTY',
    veiculoPlaca: 'ABC-1234',
    statusTexto: 'Agendado',
    statusTipo: 'agendado',
    tipoServico: '19509 - TRANS. MUDAS REFLORESTAMENTO',
    motorista: 'Valter Ribeiro',
    solicitante: 'Juliana Mendes',
    prioridade: 'Normal',
    origem: 'Viveiro',
    destino: 'Reserva Leste',
    horario: '11:30',
    velocidade: 0,
    ultimoRastreio: '15:45:10 (há 14 min)'
  },
  {
    id: 'SOL-6468',
    numeroOS: 'OS-2026-0010',
    veiculoModelo: 'CAMINHAO PIPA MB 1718',
    veiculoPlaca: 'DEF-9876',
    statusTexto: 'Em Execução',
    statusTipo: 'em_execucao',
    tipoServico: '19513 - TRANSPORTE DE ADUBO / INSUMOS',
    motorista: 'Luciano Lima',
    solicitante: 'Hassan Gustavo',
    prioridade: 'Alta',
    origem: 'Depósito A',
    destino: 'Pivô 06',
    horario: '12:00',
    velocidade: 25,
    ultimoRastreio: '15:59:05 (há 25 seg)'
  },
  {
    id: 'SOL-6460',
    numeroOS: 'OS-2026-0011',
    veiculoModelo: 'TRATOR CASE IH MAGNUM 340',
    veiculoPlaca: 'GHI-5432',
    statusTexto: 'Em Execução',
    statusTipo: 'em_execucao',
    tipoServico: '19516 - TRANSPORTE DE FUNCIONÁRIOS',
    motorista: 'Gerson Oliveira',
    solicitante: 'Coordenação Agrícola',
    prioridade: 'Média',
    origem: 'Pivô 04',
    destino: 'Refeitório Sede',
    horario: '12:30',
    velocidade: 16,
    ultimoRastreio: '15:58:50 (há 40 seg)'
  },
  {
    id: 'SOL-6455',
    numeroOS: 'OS-2026-0012',
    veiculoModelo: 'PICK-UP MITSUBISHI L200',
    veiculoPlaca: 'JKL-1122',
    statusTexto: 'Concluído',
    statusTipo: 'concluido',
    tipoServico: '19517 - TRANSPORTE DE MÁQUINAS',
    motorista: 'Bruno Souza',
    solicitante: 'Gestão de Frotas',
    prioridade: 'Média',
    origem: 'Talhão 02',
    destino: 'Oficina Central',
    horario: '07:00',
    velocidade: 60,
    ultimoRastreio: '14:30:00 (finalizado)'
  },
  {
    id: 'SOL-6450',
    numeroOS: 'OS-2026-0013',
    veiculoModelo: 'CAMINHAO VOLVO VM 330',
    veiculoPlaca: 'MNO-8899',
    statusTexto: 'Em Execução',
    statusTipo: 'em_execucao',
    tipoServico: '19514 - TRANSPORTE DE GRÃOS / COLHEITA',
    motorista: 'Adilson Santos',
    solicitante: 'Setor de Almacenagem',
    prioridade: 'Alta',
    origem: 'Talhão 09 (Milho)',
    destino: 'Silo 01 Sede',
    horario: '13:00',
    velocidade: 42,
    ultimoRastreio: '15:59:18 (há 12 seg)'
  },
  {
    id: 'SOL-6448',
    numeroOS: 'OS-2026-0014',
    veiculoModelo: 'ONIBUS SCANIA K310',
    veiculoPlaca: 'PQR-3344',
    statusTexto: 'Em Execução',
    statusTipo: 'em_execucao',
    tipoServico: '19516 - TRANSPORTE DE FUNCIONÁRIOS',
    motorista: 'Renato Mendonça',
    solicitante: 'Recursos Humanos',
    prioridade: 'Média',
    origem: 'Cidade -> Fazenda',
    destino: 'Setores Agrícolas',
    horario: '13:15',
    velocidade: 68,
    ultimoRastreio: '15:59:02 (há 28 seg)'
  },
  {
    id: 'SOL-6445',
    numeroOS: 'OS-2026-0015',
    veiculoModelo: 'TRATOR NEW HOLLAND T8',
    veiculoPlaca: 'STU-5566',
    statusTexto: 'Agendado',
    statusTipo: 'agendado',
    tipoServico: '19495 - SERVIÇO DE PREPARAÇÃO DE SOLO',
    motorista: 'Gilberto Rocha',
    solicitante: 'Engenharia Agronômica',
    prioridade: 'Normal',
    origem: 'Oficina',
    destino: 'Talhão 15',
    horario: '14:00',
    velocidade: 0,
    ultimoRastreio: '15:30:00 (há 29 min)'
  },
  {
    id: 'SOL-6440',
    numeroOS: 'OS-2026-0016',
    veiculoModelo: 'TOYOTA HILUX SW4 FIELD',
    veiculoPlaca: 'VWX-7788',
    statusTexto: 'Em Execução',
    statusTipo: 'em_execucao',
    tipoServico: '19509 - INSPEÇÃO DE PIVÔS E FISCALIZAÇÃO',
    motorista: 'Marcelo Viana',
    solicitante: 'Diretoria de Operações',
    prioridade: 'Urgente',
    origem: 'Sede',
    destino: 'Pivôs 01 ao 08',
    horario: '14:15',
    velocidade: 50,
    ultimoRastreio: '15:59:22 (há 8 seg)'
  },
  {
    id: 'SOL-6435',
    numeroOS: 'OS-2026-0017',
    veiculoModelo: 'CAMINHAO SCANIA R450',
    veiculoPlaca: 'YZA-9900',
    statusTexto: 'Em Execução',
    statusTipo: 'em_execucao',
    tipoServico: '19513 - TRANSPORTE DE DEFENSIVOS E INSUMOS',
    motorista: 'Sérgio Antunes',
    solicitante: 'Gerência Agrícola',
    prioridade: 'Alta',
    origem: 'Depósito Químico',
    destino: 'Pivô 02',
    horario: '14:30',
    velocidade: 36,
    ultimoRastreio: '15:58:45 (há 45 seg)'
  },
  {
    id: 'SOL-6430',
    numeroOS: 'OS-2026-0018',
    veiculoModelo: 'CAÇAMBA MERCEDES ACTROS',
    veiculoPlaca: 'BCD-1122',
    statusTexto: 'Concluído',
    statusTipo: 'concluido',
    tipoServico: '19514 - REMOÇÃO DE TERRA E MANUTENÇÃO',
    motorista: 'Tiago Faria',
    solicitante: 'Obras Infraestrutura',
    prioridade: 'Média',
    origem: 'Estrada Sul',
    destino: 'Borda do Açude',
    horario: '06:30',
    velocidade: 0,
    ultimoRastreio: '12:00:00 (finalizado)'
  }
];

export const TelaTVMonitor = () => {
  const { solicitacoes } = useAppContext();
  
  // Tema Claro (Branco) por padrão com opção de alternar para Escuro
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [time, setTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showConcluidos, setShowConcluidos] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const ITEMS_PER_PAGE = 10; // Exibe 10 linhas por visualização

  // Mescla solicitações reais do contexto
  const osContextoFormatadas: TVOSItem[] = solicitacoes.map((s, idx) => ({
    id: `SOL-${s.numeroOS.replace(/\D/g, '').slice(-4) || (6500 + idx)}`,
    numeroOS: s.numeroOS,
    statusTexto: s.status === 'em_execucao' ? 'Em Execução' : s.status === 'agendada' ? 'Agendado' : 'Concluído',
    statusTipo: s.status === 'em_execucao' ? 'em_execucao' : s.status === 'agendada' ? 'agendado' : 'concluido',
    tipoServico: s.tipoServico,
    veiculoModelo: s.veiculoAlocado?.modelo || 'Veículo Alocado',
    veiculoPlaca: s.veiculoAlocado?.placa || 'PLACA-000',
    motorista: s.motoristaAlocado?.nome || 'Motorista Designado',
    solicitante: s.solicitante.nome,
    prioridade: idx % 3 === 0 ? 'Alta' : idx % 2 === 0 ? 'Média' : 'Normal',
    origem: s.origem,
    destino: s.destino,
    horario: s.horarioProgramado || '08:00',
    velocidade: 40 + (idx * 5) % 30,
    ultimoRastreio: `15:59:${(10 + idx * 7) % 60} (há 20 seg)`
  }));

  const rawItems = [...osContextoFormatadas, ...DEMO_OS_LIST].filter(
    (item, index, self) => index === self.findIndex((t) => t.numeroOS === item.numeroOS)
  );

  const emExecucaoCount = rawItems.filter(i => i.statusTipo === 'em_execucao').length;
  const agendadosCount = rawItems.filter(i => i.statusTipo === 'agendado').length;
  const concluidosCount = rawItems.filter(i => i.statusTipo === 'concluido').length;

  const allItems = showConcluidos 
    ? rawItems 
    : rawItems.filter(item => item.statusTipo !== 'concluido');

  const totalPages = Math.max(1, Math.ceil(allItems.length / ITEMS_PER_PAGE));

  // Relógio ao vivo com segundos
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Rotação automática de página
  useEffect(() => {
    if (!autoScroll || totalPages <= 1) return;
    const interval = setInterval(() => {
      setCurrentPage(prev => (prev + 1) % totalPages);
    }, 8000);
    return () => clearInterval(interval);
  }, [autoScroll, totalPages]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const paginatedItems = allItems.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans select-none flex flex-col ${
      themeMode === 'light' ? 'bg-[#F8FAFC] text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      
      {/* BARRA SUPERIOR PREMIUM COM A MARCA AGROTECH FAZENDA PROGRESSO */}
      <header className={`px-8 py-4 border-b flex items-center justify-between shadow-md transition-colors ${
        themeMode === 'light' ? 'bg-slate-900 text-white border-slate-800' : 'bg-slate-900 text-white border-slate-800'
      }`}>
        
        {/* LOGO DA FAZENDA PROGRESSO */}
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
            <Leaf className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">AgroTech Logística</span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-none">
              FAZENDA<span className="text-emerald-400">PROGRESSO</span>
            </h1>
          </div>
        </div>

        {/* CARDS DE KPIS EM TEMPO REAL (AGROTECH DASHBOARD) */}
        <div className="hidden lg:flex items-center space-x-4">
          <div className="bg-slate-800/90 border border-slate-700/80 px-4 py-2 rounded-2xl flex items-center space-x-3 shadow-inner">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Em Execução</p>
              <p className="text-lg font-black text-emerald-400 leading-none">{emExecucaoCount} Viagens</p>
            </div>
          </div>

          <div className="bg-slate-800/90 border border-slate-700/80 px-4 py-2 rounded-2xl flex items-center space-x-3 shadow-inner">
            <Clock className="w-4 h-4 text-blue-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Agendadas</p>
              <p className="text-lg font-black text-blue-400 leading-none">{agendadosCount} OS</p>
            </div>
          </div>

          <div className="bg-slate-800/90 border border-slate-700/80 px-4 py-2 rounded-2xl flex items-center space-x-3 shadow-inner">
            <CheckCircle2 className="w-4 h-4 text-slate-300" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Concluídas Hoje</p>
              <p className="text-lg font-black text-slate-200 leading-none">{concluidosCount} OS</p>
            </div>
          </div>
        </div>

        {/* RELÓGIO & CONTROLES DE TEMA (CLARO BRANCO VS ESCURO) */}
        <div className="flex items-center space-x-5">
          
          {/* Relógio Digital */}
          <div className="text-right">
            <p className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
              {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center justify-end">
              <Activity size={10} className="mr-1 animate-pulse" /> Ao Vivo TV
            </p>
          </div>

          <div className="h-8 w-px bg-slate-800"></div>

          {/* Botões de Ação */}
          <div className="flex items-center space-x-2">
            
            {/* Opção de Esconder / Exibir Concluídos */}
            <button 
              onClick={() => {
                setShowConcluidos(!showConcluidos);
                setCurrentPage(0);
              }}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm ${
                showConcluidos 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border-emerald-500/40'
              }`}
              title={showConcluidos ? 'Clique para esconder chamados concluídos' : 'Clique para exibir chamados concluídos'}
            >
              {showConcluidos ? (
                <>
                  <EyeOff size={15} />
                  <span className="hidden sm:inline">Esconder Concluídos</span>
                </>
              ) : (
                <>
                  <Eye size={15} />
                  <span className="hidden sm:inline">Exibir Concluídos</span>
                </>
              )}
            </button>

            {/* Alternar entre Modo Claro (Branco) e Escuro */}
            <button 
              onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
              className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all border border-slate-700 shadow-sm"
              title="Alternar entre Visual Claro (Branco) e Escuro"
            >
              {themeMode === 'light' ? (
                <>
                  <Moon size={15} className="text-amber-300" />
                  <span className="hidden sm:inline">Modo Escuro</span>
                </>
              ) : (
                <>
                  <Sun size={15} className="text-amber-400" />
                  <span className="hidden sm:inline">Modo Claro (Branco)</span>
                </>
              )}
            </button>

            {/* Auto-scroll */}
            <button 
              onClick={() => setAutoScroll(!autoScroll)}
              className={`p-2 rounded-xl text-xs font-bold transition-all border ${
                autoScroll ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title={autoScroll ? 'Pausar rotação' : 'Iniciar rotação'}
            >
              {autoScroll ? <Pause size={16} /> : <Play size={16} />}
            </button>

            {/* Tela Cheia */}
            <button 
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all border border-slate-700"
              title="Modo TV Tela Cheia"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* CONTEÚDO DA TV: TABELA PREMIUM ESTILO AGROTECH EM UMA SÓ LINHA */}
      <main className="flex-1 p-6 flex flex-col justify-between max-w-[1920px] w-full mx-auto overflow-hidden">
        
        <div className={`rounded-3xl shadow-xl border overflow-hidden flex-1 flex flex-col transition-colors ${
          themeMode === 'light' 
            ? 'bg-white border-slate-200/80 shadow-slate-200/50' 
            : 'bg-slate-900 border-slate-800/80 shadow-black/40'
        }`}>
          
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              
              {/* CABEÇALHO DA TABELA NO PADRÃO DA PLATAFORMA */}
              <thead>
                <tr className={`text-xs sm:text-sm font-black uppercase tracking-wider border-b ${
                  themeMode === 'light' 
                    ? 'bg-slate-900 text-slate-200 border-slate-800' 
                    : 'bg-slate-950 text-slate-300 border-slate-800'
                }`}>
                  <th className="py-3.5 px-4 w-32 font-mono text-center">OS / Chamado</th>
                  <th className="py-3.5 px-4 w-40">Status</th>
                  <th className="py-3.5 px-5 font-extrabold">Serviço & Rota</th>
                  <th className="py-3.5 px-5">Veículo & Placa</th>
                  <th className="py-3.5 px-4">Motorista Alocado</th>
                  <th className="py-3.5 px-4">Solicitante</th>
                  <th className="py-3.5 px-4">Último Rastreio</th>
                  <th className="py-3.5 px-4 w-28 text-center">Prioridade</th>
                </tr>
              </thead>

              {/* LINHAS DA TABELA EM UMA SÓ LINHA (SINGLE LINE PER ROW) */}
              <tbody className="divide-y divide-slate-200/60">
                {paginatedItems.map((item, index) => {
                  const isEven = index % 2 === 0;
                  
                  let badgeStatus = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  let dotStatus = 'bg-emerald-500';
                  
                  if (item.statusTipo === 'agendado') {
                    badgeStatus = 'bg-blue-50 text-blue-700 border-blue-200';
                    dotStatus = 'bg-blue-500';
                  } else if (item.statusTipo === 'concluido') {
                    badgeStatus = 'bg-slate-100 text-slate-600 border-slate-200';
                    dotStatus = 'bg-slate-400';
                  }

                  let prioridadeClass = 'bg-slate-100 text-slate-700 border-slate-200';
                  if (item.prioridade === 'Média') prioridadeClass = 'bg-blue-50 text-blue-700 border-blue-200';
                  if (item.prioridade === 'Alta') prioridadeClass = 'bg-amber-50 text-amber-800 border-amber-200';
                  if (item.prioridade === 'Urgente') prioridadeClass = 'bg-rose-50 text-rose-700 border-rose-200 font-bold';

                  return (
                    <tr 
                      key={item.id}
                      className={`transition-colors duration-150 whitespace-nowrap ${
                        themeMode === 'light' 
                          ? (isEven ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/50 hover:bg-slate-100/60')
                          : (isEven ? 'bg-slate-900 hover:bg-slate-800/60' : 'bg-slate-950/40 hover:bg-slate-800/60')
                      }`}
                    >
                      {/* OS NUMERO (EM UMA SO LINHA) */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 text-xs sm:text-sm text-center whitespace-nowrap">
                        <span className="bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-xs text-slate-800">
                          {item.numeroOS}
                        </span>
                      </td>

                      {/* STATUS BADGE (EM UMA SO LINHA) */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeStatus}`}>
                          <span className={`w-2 h-2 rounded-full ${dotStatus} mr-1.5 animate-pulse`}></span>
                          {item.statusTexto}
                        </span>
                      </td>

                      {/* SERVIÇO E ROTA (EM UMA SO LINHA COM BULLET) */}
                      <td className="py-3 px-5 whitespace-nowrap">
                        <span className="font-bold text-slate-800 text-xs sm:text-sm">
                          {item.tipoServico}
                        </span>
                        <span className="text-xs font-semibold text-slate-400 mx-2">•</span>
                        <span className="text-xs font-semibold text-emerald-700 inline-flex items-center">
                          <MapPin size={12} className="mr-1 text-emerald-600 shrink-0 inline" />
                          {item.origem} &rarr; {item.destino}
                        </span>
                      </td>

                      {/* VEÍCULO & PLACA (EM UMA SO LINHA) */}
                      <td className="py-3 px-5 whitespace-nowrap">
                        <span className="inline-flex items-center text-xs font-bold text-slate-800">
                          <Truck size={14} className="mr-1.5 text-emerald-700 shrink-0" />
                          {item.veiculoModelo}
                        </span>
                        <span className="ml-2 font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {item.veiculoPlaca}
                        </span>
                      </td>

                      {/* MOTORISTA (EM UMA SO LINHA) */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-xs font-bold text-slate-800 inline-flex items-center">
                          <User size={13} className="mr-1.5 text-slate-400 shrink-0" />
                          {item.motorista}
                        </span>
                      </td>

                      {/* SOLICITANTE (EM UMA SO LINHA) */}
                      <td className="py-3 px-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                        {item.solicitante}
                      </td>

                      {/* COLUNA: ÚLTIMO HORÁRIO DE RASTREIO */}
                      <td className="py-3 px-4 text-xs font-mono font-semibold text-slate-600 whitespace-nowrap">
                        <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                          <Radio size={12} className="mr-1.5 text-emerald-600 animate-pulse" />
                          {item.ultimoRastreio}
                        </span>
                      </td>

                      {/* PRIORIDADE (EM UMA SO LINHA) */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`inline-block px-3 py-0.5 rounded-lg text-xs font-bold border ${prioridadeClass}`}>
                          {item.prioridade}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* RODAPÉ DA TABELA NO ESTILO AGROTECH */}
          <div className={`px-6 py-3 border-t flex items-center justify-between text-xs font-bold ${
            themeMode === 'light' ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-slate-950 text-slate-400 border-slate-800'
          }`}>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Exibindo {currentPage * ITEMS_PER_PAGE + 1} a {Math.min((currentPage + 1) * ITEMS_PER_PAGE, allItems.length)} de {allItems.length} solicitações monitoradas</span>
            </div>

            {/* CONTROLES DE PÁGINA */}
            <div className="flex items-center space-x-3">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">Página {currentPage + 1} de {totalPages}</span>
              
              <div className="flex space-x-1">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                  disabled={currentPage === 0}
                  className="p-1.5 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-30 transition-colors shadow-xs"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="p-1.5 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-30 transition-colors shadow-xs"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
