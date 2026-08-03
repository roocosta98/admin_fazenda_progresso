import { useState } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { 
  Truck, 
  MapPin, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  ArrowLeft, 
  X, 
  Search, 
  ChevronRight, 
  User, 
  Zap,
  Building2,
  FolderKanban,
  Wrench,
  Edit3
} from 'lucide-react';
import { Modal } from '../../../components/common/Modal';
import { SlideOverDrawer } from '../../../components/common/SlideOverDrawer';

interface NovaSolicitacaoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// 1. VEÍCULOS (Passo 1)
const VEICULOS_SANKHYA = [
  { id: '25', codigo: '25', descricao: '25 - ONIBUS M.BENZ 1318 - Placa: BXE7320', modelo: 'M.BENZ 1318', tipo: 'Ônibus', placa: 'BXE7320' },
  { id: '29', codigo: '29', descricao: '29 - CAÇAMBA M.BENZ 1513 - Placa: CXU6289', modelo: 'M.BENZ 1513', tipo: 'Caçamba', placa: 'CXU6289' },
  { id: '32', codigo: '32', descricao: '32 - ONIBUS M.BENZ 1620 - Placa: ICM1818', modelo: 'M.BENZ 1620', tipo: 'Ônibus', placa: 'ICM1818' },
  { id: '35', codigo: '35', descricao: '35 - CAMINHAO M.BENZ 1313 - Placa: IEU7100', modelo: 'M.BENZ 1313', tipo: 'Caminhão', placa: 'IEU7100' },
  { id: '36', codigo: '36', descricao: '36 - CAVALO MECANICO M.BENZ/ LS 1935 - Placa: ICY0877', modelo: 'M.BENZ/ LS 1935', tipo: 'Prancha', placa: 'ICY0877' },
  { id: '40', codigo: '40', descricao: '40 - PICK-UP TOYOTA HILUX 4X4 - Placa: JKL9012', modelo: 'Toyota Hilux', tipo: 'Pick-up', placa: 'JKL9012' },
  { id: '42', codigo: '42', descricao: '42 - TRATOR JOHN DEERE 8335R - Placa: MNO3456', modelo: 'John Deere 8335R', tipo: 'Trator', placa: 'MNO3456' },
  { id: '45', codigo: '45', descricao: '45 - COMBOIO MERCEDES BENZ 2726 - Placa: PQR7890', modelo: 'MB 2726', tipo: 'Comboio', placa: 'PQR7890' },
  { id: '48', codigo: '48', descricao: '48 - PRANCHA 3 EIXOS HEAVY DUTY - Placa: ABC1234', modelo: 'Prancha 3 Eixos', tipo: 'Prancha', placa: 'ABC1234' },
];

// 2. SERVIÇOS (Passo 2)
const SERVICOS_SANKHYA = [
  { id: '19495', codigo: '19495', descricao: '19495 - SERVIÇO DE SILAGEM' },
  { id: '19509', codigo: '19509', descricao: '19509 - TRANS. MUDAS REFLORESTAMENTO' },
  { id: '19510', codigo: '19510', descricao: '19510 - TRANSPORTE BATATA SEMENTE' },
  { id: '19511', codigo: '19511', descricao: '19511 - TRANSPORTE DE ÁGUA' },
  { id: '19512', codigo: '19512', descricao: '19512 - TRANSPORTE DE BATATA CONSUMO' },
  { id: '19513', codigo: '19513', descricao: '19513 - TRANSPORTE DE ADUBO / INSUMOS' },
  { id: '19514', codigo: '19514', descricao: '19514 - TRANSPORTE DE GRÃOS / COLHEITA' },
  { id: '19515', codigo: '19515', descricao: '19515 - SOCORRO MECÂNICO / COMBOIO' },
  { id: '19516', codigo: '19516', descricao: '19516 - TRANSPORTE DE FUNCIONÁRIOS' },
  { id: '19517', codigo: '19517', descricao: '19517 - TRANSPORTE DE MÁQUINAS E EQUIPAMENTOS' },
];

// 3. PROJETOS (Passo 3)
const PROJETOS_SANKHYA = [
  { id: '4110100', codigo: '4110100', descricao: '4110100 - BENEFICIAMENTO BATATA 2024', nome: 'BENEFICIAMENTO BATATA 2024', centroCusto: 'CC-4110100' },
  { id: '6010100', codigo: '6010100', descricao: '6010100 - FP1P01 - BATATA SEMENTE 2026', nome: 'FP1P01 - BATATA SEMENTE 2026', centroCusto: 'CC-6010100' },
  { id: '6010500', codigo: '6010500', descricao: '6010500 - FP1P05 - BATATA 2026', nome: 'FP1P05 - BATATA 2026', centroCusto: 'CC-6010500' },
  { id: '6010501', codigo: '6010501', descricao: '6010501 - FP1P05 - LOTE 01 BATATA 2026', nome: 'FP1P05 - LOTE 01 BATATA 2026', centroCusto: 'CC-6010501' },
  { id: '6010502', codigo: '6010502', descricao: '6010502 - FP1P05 - LOTE 02 BATATA 2026', nome: 'FP1P05 - LOTE 02 BATATA 2026', centroCusto: 'CC-6010502' },
  { id: '6010600', codigo: '6010600', descricao: '6010600 - SAFRA SOJA LESTE 2026', nome: 'SAFRA SOJA LESTE 2026', centroCusto: 'CC-6010600' },
  { id: '6010700', codigo: '6010700', descricao: '6010700 - INFRAESTRUTURA E MANUTENÇÃO SEDE', nome: 'INFRAESTRUTURA E MANUTENÇÃO SEDE', centroCusto: 'CC-6010700' },
];

// 4. SOLICITANTES (Passo 4 - Com a 1ª opção sendo "Eu (Próprio)")
const SOLICITANTES_SANKHYA = [
  { id: 'eu', codigo: '1000', descricao: 'EU (PRÓPRIO)', nome: 'Eu (Próprio)' },
  { id: '1001', codigo: '1001', descricao: '1001 - JOÃO - TÉCNICO DE CAMPO', nome: 'João - Técnico de Campo' },
  { id: '1002', codigo: '1002', descricao: '1002 - CARLOS - GESTOR DE FROTA', nome: 'Carlos - Gestor de Frota' },
  { id: '1003', codigo: '1003', descricao: '1003 - ANTÔNIO - OPERADOR LOGÍSTICO', nome: 'Antônio - Operador Logístico' },
  { id: '1004', codigo: '1004', descricao: '1004 - MARIA SILVA - ENGENHEIRA AGRÔNOMA', nome: 'Maria Silva - Engenheira Agrônoma' },
  { id: '1005', codigo: '1005', descricao: '1005 - ROBERTO SOUZA - SUPERVISOR DE OPERAÇÕES', nome: 'Roberto Souza - Supervisor de Operações' },
  { id: '1006', codigo: '1006', descricao: '1006 - FERNANDO ALVES - GERENTE AGRÍCOLA', nome: 'Fernando Alves - Gerente Agrícola' },
];

// 5. PROJETO / CENTRO DE CUSTO (Passo 5 - Exibido como PROJETO)
const CENTROS_CUSTO_SANKHYA = [
  { id: '10101', codigo: '10101', descricao: '10101 - CC-BATATA-26 - PRODUÇÃO DE BATATA', centroCusto: 'CC-BATATA-26' },
  { id: '10102', codigo: '10102', descricao: '10102 - CC-SOJA-L-26 - SAFRA SOJA LESTE', centroCusto: 'CC-SOJA-L-26' },
  { id: '10103', codigo: '10103', descricao: '10103 - CC-INFRA - INFRAESTRUTURA E MANUTENÇÃO', centroCusto: 'CC-INFRA' },
  { id: '10104', codigo: '10104', descricao: '10104 - CC-ALMOX - ALMOXARIFADO CENTRAL', centroCusto: 'CC-ALMOX' },
  { id: '10105', codigo: '10105', descricao: '10105 - CC-MECANICA - OFICINA E MANUTENÇÃO', centroCusto: 'CC-MECANICA' },
  { id: '10106', codigo: '10106', descricao: '10106 - CC-IRRIGACAO - SISTEMA DE IRRIGAÇÃO E PIVÔS', centroCusto: 'CC-IRRIGACAO' },
];

// 6. LOCAIS SANKHYA (Origem / Destino - Lista personalizada sem digitação livre)
const LOCAIS_SANKHYA = [
  '101 - FAZENDA PROGRESSO - SEDE',
  '102 - SILO PRINCIPAL / ARMAZÉM',
  '103 - OFICINA CENTRAL & ABASTECIMENTO',
  '104 - GALPÃO DE INSUMOS E DEFENSIVOS',
  '105 - LOTE 01 - CAMPO DE BATATA SEMENTE',
  '106 - LOTE 04 - CAMPO DE SILAGEM',
  '107 - LOTE 12 - SAFRA SOJA LESTE',
  '108 - LOTE 15 - CAMPO DE MILHO',
  '109 - PEDREIRA / USINA DE BRITAGEM',
  '110 - BALANÇA ROVIARA',
  '111 - LAVA JATO / GARAGEM CENTRAL',
  '112 - PONTO DE TRANSBORDO PORTO'
];

export const NovaSolicitacaoDrawer = ({ isOpen, onClose, onSuccess }: NovaSolicitacaoDrawerProps) => {
  const { criarSolicitacao } = useAppContext();
  const { usuario } = useAuth();
  
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Seleções sequenciais
  const [veiculoSel, setVeiculoSel] = useState<typeof VEICULOS_SANKHYA[0] | null>(null);
  const [servicoSel, setServicoSel] = useState<typeof SERVICOS_SANKHYA[0] | null>(null);
  const [projetoSel, setProjetoSel] = useState<typeof PROJETOS_SANKHYA[0] | null>(null);
  const [solicitanteSel, setSolicitanteSel] = useState<typeof SOLICITANTES_SANKHYA[0] | null>(SOLICITANTES_SANKHYA[0]);
  const [centroCustoSel, setCentroCustoSel] = useState<typeof CENTROS_CUSTO_SANKHYA[0] | null>(null);

  // Campos finais (Passo 6)
  const [origem, setOrigem] = useState(LOCAIS_SANKHYA[0]);
  const [destino, setDestino] = useState(LOCAIS_SANKHYA[1]);
  const [dataProgramada, setDataProgramada] = useState(new Date().toISOString().split('T')[0]);
  const [horarioSaida, setHorarioSaida] = useState(''); // Opcional
  const [observacoes, setObservacoes] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const handleReset = () => {
    setCurrentStep(1);
    setSearchTerm('');
    setVeiculoSel(null);
    setServicoSel(null);
    setProjetoSel(null);
    setSolicitanteSel(SOLICITANTES_SANKHYA[0]);
    setCentroCustoSel(null);
    setOrigem(LOCAIS_SANKHYA[0]);
    setDestino(LOCAIS_SANKHYA[1]);
    setDataProgramada(new Date().toISOString().split('T')[0]);
    setHorarioSaida('');
    setObservacoes('');
  };

  const handleCloseAll = () => {
    handleReset();
    onClose();
  };

  const handleBackStep = () => {
    setSearchTerm('');
    if (currentStep > 1) {
      setCurrentStep(prev => (prev - 1) as any);
    } else {
      handleCloseAll();
    }
  };

  const handleSelectVeiculo = (item: typeof VEICULOS_SANKHYA[0]) => {
    setVeiculoSel(item);
    setSearchTerm('');
    setCurrentStep(2); // Avança para SERVIÇOS
  };

  const handleSelectServico = (item: typeof SERVICOS_SANKHYA[0]) => {
    setServicoSel(item);
    setSearchTerm('');
    setCurrentStep(3); // Avança para PROJETOS
  };

  const handleSelectProjeto = (item: typeof PROJETOS_SANKHYA[0]) => {
    setProjetoSel(item);
    setSearchTerm('');
    setCurrentStep(4); // Avança para SOLICITANTE
  };

  const handleSelectSolicitante = (item: typeof SOLICITANTES_SANKHYA[0]) => {
    setSolicitanteSel(item);
    setSearchTerm('');
    setCurrentStep(5); // Avança para PROJETO (Centro de Custo)
  };

  const handleSelectCentroCusto = (item: typeof CENTROS_CUSTO_SANKHYA[0]) => {
    setCentroCustoSel(item);
    setSearchTerm('');
    setCurrentStep(6); // Avança para DETALHES E ROTA
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!veiculoSel || !servicoSel || !projetoSel || !solicitanteSel || !centroCustoSel) return;

    setIsLoading(true);

    setTimeout(() => {
      let horarioFormatado = '';
      if (horarioSaida) {
        horarioFormatado = `Saída: ${horarioSaida}`;
      }

      const nomeSolicitanteFinal = solicitanteSel.id === 'eu' 
        ? (usuario?.nome || 'Eu (Próprio)') 
        : solicitanteSel.nome;

      criarSolicitacao({
        solicitante: {
          id: solicitanteSel.id === 'eu' ? (usuario?.id || 'eu') : solicitanteSel.id,
          nome: nomeSolicitanteFinal,
          perfil: 'solicitante',
          departamento: 'Operações'
        },
        tipoServico: servicoSel.descricao,
        origem,
        destino,
        dataProgramada,
        horarioProgramado: horarioFormatado || undefined,
        projeto: {
          id: projetoSel.id,
          nome: projetoSel.nome,
          centroCusto: centroCustoSel.centroCusto
        },
        observacoes: observacoes 
          ? `[Veículo: ${veiculoSel.descricao}] - ${observacoes}`
          : `[Veículo: ${veiculoSel.descricao}]`
      });

      setIsLoading(false);
      setSuccessModalOpen(true);
    }, 700);
  };

  const handleFinish = () => {
    setSuccessModalOpen(false);
    handleReset();
    onSuccess();
    onClose();
  };

  // Título e subtítulo do Header por passo
  const getHeaderTitle = () => {
    switch (currentStep) {
      case 1: return 'VEÍCULOS';
      case 2: return 'SERVIÇOS';
      case 3: return 'PROJETOS';
      case 4: return 'SOLICITANTE';
      case 5: return 'PROJETO';
      case 6: return 'DETALHES DA SOLICITAÇÃO';
    }
  };

  // Filtros de busca para cada lista
  const filteredVeiculos = VEICULOS_SANKHYA.filter(v => 
    v.descricao.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.placa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredServicos = SERVICOS_SANKHYA.filter(s => 
    s.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProjetos = PROJETOS_SANKHYA.filter(p => 
    p.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSolicitantes = SOLICITANTES_SANKHYA.filter(s => 
    s.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.id === 'eu' && usuario?.nome && usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredCentrosCusto = CENTROS_CUSTO_SANKHYA.filter(c => 
    c.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <SlideOverDrawer 
        isOpen={isOpen} 
        onClose={handleCloseAll} 
        title="" 
        width="max-w-xl"
        hideDefaultHeader={true}
        noPadding={true}
      >
        <div className="flex flex-col h-full bg-slate-50 min-h-screen">
          
          {/* Header Premium (Mesmo Tom do Sidebar - Slate 900) */}
          <div className="bg-slate-900 text-white px-4 py-4 sticky top-0 z-30 shadow-md border-b border-slate-800">
            <div className="flex items-center justify-between">
              <button 
                type="button" 
                onClick={handleBackStep}
                className="p-2 rounded-full hover:bg-white/15 text-white transition-colors flex items-center justify-center"
                title="Voltar"
              >
                <ArrowLeft size={22} />
              </button>
              
              <div className="text-center flex-1 mx-2">
                <h2 className="text-lg font-extrabold tracking-wider uppercase">
                  {getHeaderTitle()}
                </h2>
                <div className="text-[11px] font-medium text-slate-400 tracking-wide mt-0.5">
                  Passo {currentStep} de 6 — Seleção Sequencial
                </div>
              </div>

              <button 
                type="button" 
                onClick={handleCloseAll}
                className="p-2 rounded-full hover:bg-white/15 text-white transition-colors flex items-center justify-center"
                title="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            {/* Barra de Progresso Superior */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-emerald-400 h-full transition-all duration-300 ease-out"
                style={{ width: `${(currentStep / 6) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Barra de Pesquisa (Passos 1 a 5 - Azul) */}
          {currentStep >= 1 && currentStep <= 5 && (
            <div className="p-4 bg-white border-b border-slate-200 shadow-sm sticky top-[76px] z-20">
              <div className="relative flex items-center bg-slate-50 rounded-2xl border border-slate-200/80 px-3 py-2.5 focus-within:bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mr-3 shrink-0">
                  <Search size={18} />
                </div>
                <input 
                  type="text"
                  className="w-full bg-transparent text-sm outline-none font-medium text-slate-800 placeholder-slate-400"
                  placeholder="Pesquisar"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')} 
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Conteúdo Principal: Passos 1 a 5 (Listagens com Chevron >) */}
          <div className="flex-1 bg-white">
            
            {/* PASSO 1: VEÍCULOS */}
            {currentStep === 1 && (
              <div className="divide-y divide-slate-100">
                {filteredVeiculos.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 font-medium">Nenhum veículo encontrado</div>
                ) : (
                  filteredVeiculos.map((v) => (
                    <div 
                      key={v.id}
                      onClick={() => handleSelectVeiculo(v)}
                      className="flex items-center justify-between px-5 py-4 hover:bg-blue-50/70 cursor-pointer transition-all duration-150 group border-b border-slate-100"
                    >
                      <div className="flex items-center space-x-3 pr-4">
                        <Truck size={18} className="text-slate-400 group-hover:text-blue-600 shrink-0" />
                        <span className="text-sm font-semibold text-slate-800 uppercase tracking-wide group-hover:text-blue-900 leading-snug">
                          {v.descricao}
                        </span>
                      </div>
                      <ChevronRight size={18} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
                    </div>
                  ))
                )}
              </div>
            )}

            {/* PASSO 2: SERVIÇOS */}
            {currentStep === 2 && (
              <div className="divide-y divide-slate-100">
                {filteredServicos.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 font-medium">Nenhum serviço encontrado</div>
                ) : (
                  filteredServicos.map((s) => (
                    <div 
                      key={s.id}
                      onClick={() => handleSelectServico(s)}
                      className="flex items-center justify-between px-5 py-4 hover:bg-blue-50/70 cursor-pointer transition-all duration-150 group border-b border-slate-100"
                    >
                      <div className="flex items-center space-x-3 pr-4">
                        <Wrench size={18} className="text-slate-400 group-hover:text-blue-600 shrink-0" />
                        <span className="text-sm font-semibold text-slate-800 uppercase tracking-wide group-hover:text-blue-900 leading-snug">
                          {s.descricao}
                        </span>
                      </div>
                      <ChevronRight size={18} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
                    </div>
                  ))
                )}
              </div>
            )}

            {/* PASSO 3: PROJETOS */}
            {currentStep === 3 && (
              <div className="divide-y divide-slate-100">
                {filteredProjetos.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 font-medium">Nenhum projeto encontrado</div>
                ) : (
                  filteredProjetos.map((p) => (
                    <div 
                      key={p.id}
                      onClick={() => handleSelectProjeto(p)}
                      className="flex items-center justify-between px-5 py-4 hover:bg-blue-50/70 cursor-pointer transition-all duration-150 group border-b border-slate-100"
                    >
                      <div className="flex items-center space-x-3 pr-4">
                        <FolderKanban size={18} className="text-slate-400 group-hover:text-blue-600 shrink-0" />
                        <span className="text-sm font-semibold text-slate-800 uppercase tracking-wide group-hover:text-blue-900 leading-snug">
                          {p.descricao}
                        </span>
                      </div>
                      <ChevronRight size={18} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
                    </div>
                  ))
                )}
              </div>
            )}

            {/* PASSO 4: SOLICITANTE */}
            {currentStep === 4 && (
              <div className="divide-y divide-slate-100">
                {filteredSolicitantes.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 font-medium">Nenhum solicitante encontrado</div>
                ) : (
                  filteredSolicitantes.map((sol) => {
                    const isEu = sol.id === 'eu';
                    const textoExibicao = isEu 
                      ? `EU (${usuario?.nome ? usuario.nome.toUpperCase() : 'PRÓPRIO SOLICITANTE'})` 
                      : sol.descricao;

                    return (
                      <div 
                        key={sol.id}
                        onClick={() => handleSelectSolicitante(sol)}
                        className={`flex items-center justify-between px-5 py-4 hover:bg-blue-50/70 cursor-pointer transition-all duration-150 group border-b border-slate-100 ${
                          isEu ? 'bg-blue-50/40 font-bold' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3 pr-4">
                          <User size={18} className={`${isEu ? 'text-blue-600' : 'text-slate-400'} group-hover:text-blue-600 shrink-0`} />
                          <span className={`text-sm tracking-wide uppercase group-hover:text-blue-900 leading-snug ${
                            isEu ? 'font-black text-blue-900' : 'font-semibold text-slate-800'
                          }`}>
                            {textoExibicao}
                          </span>
                        </div>
                        <ChevronRight size={18} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* PASSO 5: PROJETO (Substitui Centro de Custo) */}
            {currentStep === 5 && (
              <div className="divide-y divide-slate-100">
                {filteredCentrosCusto.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 font-medium">Nenhum projeto encontrado</div>
                ) : (
                  filteredCentrosCusto.map((cc) => (
                    <div 
                      key={cc.id}
                      onClick={() => handleSelectCentroCusto(cc)}
                      className="flex items-center justify-between px-5 py-4 hover:bg-blue-50/70 cursor-pointer transition-all duration-150 group border-b border-slate-100"
                    >
                      <div className="flex items-center space-x-3 pr-4">
                        <Building2 size={18} className="text-slate-400 group-hover:text-blue-600 shrink-0" />
                        <span className="text-sm font-semibold text-slate-800 uppercase tracking-wide group-hover:text-blue-900 leading-snug">
                          {cc.descricao}
                        </span>
                      </div>
                      <ChevronRight size={18} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
                    </div>
                  ))
                )}
              </div>
            )}

            {/* PASSO 6: DETALHES E ROTA DA SOLICITAÇÃO */}
            {currentStep === 6 && (
              <div className="p-6 bg-slate-50 min-h-full space-y-6">
                
                {/* Resumo dos itens selecionados previamente com botão de editar */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Itens Selecionados</span>
                    <span className="text-[11px] text-blue-600 font-bold">5 de 5 Escolhidos</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="font-semibold text-slate-600 flex items-center"><Truck size={14} className="mr-2 text-blue-600" /> Veículo:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800">{veiculoSel?.descricao}</span>
                        <button onClick={() => setCurrentStep(1)} className="text-blue-600 hover:text-blue-800 p-1" title="Alterar">
                          <Edit3 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="font-semibold text-slate-600 flex items-center"><Wrench size={14} className="mr-2 text-blue-600" /> Serviço:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800">{servicoSel?.descricao}</span>
                        <button onClick={() => setCurrentStep(2)} className="text-blue-600 hover:text-blue-800 p-1" title="Alterar">
                          <Edit3 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="font-semibold text-slate-600 flex items-center"><FolderKanban size={14} className="mr-2 text-blue-600" /> Projeto:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800">{projetoSel?.descricao}</span>
                        <button onClick={() => setCurrentStep(3)} className="text-blue-600 hover:text-blue-800 p-1" title="Alterar">
                          <Edit3 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="font-semibold text-slate-600 flex items-center"><User size={14} className="mr-2 text-blue-600" /> Solicitante:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800">
                          {solicitanteSel?.id === 'eu' ? `EU (${usuario?.nome?.toUpperCase() || 'PRÓPRIO SOLICITANTE'})` : solicitanteSel?.descricao}
                        </span>
                        <button onClick={() => setCurrentStep(4)} className="text-blue-600 hover:text-blue-800 p-1" title="Alterar">
                          <Edit3 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="font-semibold text-slate-600 flex items-center"><Building2 size={14} className="mr-2 text-blue-600" /> Projeto (Centro Custo):</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800">{centroCustoSel?.descricao}</span>
                        <button onClick={() => setCurrentStep(5)} className="text-blue-600 hover:text-blue-800 p-1" title="Alterar">
                          <Edit3 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Formulário Final de Rota e Agendamento */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Seleção de Origem e Destino (Lista Personalizada Sankhya - Sem Digitação Livre) */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center border-b border-slate-100 pb-2">
                      <MapPin size={16} className="mr-2 text-blue-600" /> Rota (Lista Personalizada Sankhya)
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                          Origem
                        </label>
                        <select
                          required
                          className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all bg-white text-sm font-semibold text-slate-800 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%231E40AF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.2em] bg-[right_1rem_center] bg-no-repeat shadow-sm"
                          value={origem}
                          onChange={(e) => setOrigem(e.target.value)}
                        >
                          {LOCAIS_SANKHYA.map((loc) => (
                            <option key={loc} value={loc}>{loc}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                          Destino
                        </label>
                        <select
                          required
                          className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all bg-white text-sm font-semibold text-slate-800 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%231E40AF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.2em] bg-[right_1rem_center] bg-no-repeat shadow-sm"
                          value={destino}
                          onChange={(e) => setDestino(e.target.value)}
                        >
                          {LOCAIS_SANKHYA.map((loc) => (
                            <option key={loc} value={loc}>{loc}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Agendamento de Data e Hora Saída Opcional */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center border-b border-slate-100 pb-2">
                      <Calendar size={16} className="mr-2 text-blue-600" /> Programação de Data e Horário
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                          Data Programada <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="date" 
                          required
                          className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 shadow-sm"
                          value={dataProgramada}
                          onChange={(e) => setDataProgramada(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                          Hora Saída <span className="text-slate-400 font-normal lowercase">(opcional)</span>
                        </label>
                        <div className="relative">
                          <input 
                            type="time" 
                            className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 shadow-sm"
                            value={horarioSaida}
                            onChange={(e) => setHorarioSaida(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Observações Adicionais */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center">
                      <FileText size={16} className="mr-2 text-blue-600" /> Observações Adicionais <span className="text-slate-400 font-normal lowercase ml-1">(opcional)</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Ex: Passar primeiro no Pivô 01, depois Pivô 04. Carga sensível a chuva, se possivel antes das 12h"
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 resize-none shadow-sm"
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                    ></textarea>
                  </div>

                  {/* Botões do Rodapé */}
                  <div className="pt-4 flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleCloseAll}
                      className="px-5 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-200/60 transition-colors text-sm"
                    >
                      Cancelar
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-slate-900 hover:bg-slate-800 text-white px-7 py-3 rounded-xl font-bold transition-all shadow-lg shadow-slate-900/20 flex items-center text-sm disabled:opacity-70"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processando...
                        </div>
                      ) : (
                        <>
                          Salvar <Zap size={16} className="ml-2 text-emerald-400" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </SlideOverDrawer>

      {/* Modal de Sucesso */}
      <Modal isOpen={successModalOpen} onClose={handleFinish} title="Integração Concluída!">
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-slate-100 text-slate-900 rounded-full flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 bg-slate-900 rounded-full animate-ping opacity-20"></div>
            <CheckCircle2 size={42} className="relative z-10 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-2">OS Gerada com Sucesso!</h3>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed text-sm">
            Sua solicitação foi registrada e enviada para a fila de planejamento da logística (Integrado via Sankhya).
          </p>
          <button
            onClick={handleFinish}
            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg text-sm flex items-center justify-center"
          >
            Acompanhar Pedidos
          </button>
        </div>
      </Modal>
    </>
  );
};
