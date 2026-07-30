import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { 
  SolicitacaoTransporte, 
  StatusSolicitacao, 
  NotificacaoSimulada,
  Projeto,
  Veiculo,
  Motorista
} from '../types';
import { MOCK_SOLICITACOES, MOCK_VEICULOS, MOCK_MOTORISTAS, MOCK_PROJETOS } from '../mock/data';

interface AppContextType {
  solicitacoes: SolicitacaoTransporte[];
  notificacoes: NotificacaoSimulada[];
  projetos: Projeto[];
  veiculos: Veiculo[];
  motoristas: Motorista[];
  criarSolicitacao: (dados: Omit<SolicitacaoTransporte, 'id' | 'numeroOS' | 'status' | 'dataSolicitacao'>) => void;
  aprovarEAgendarSolicitacao: (idOS: string, veiculoId: string, motoristaId: string, horarioConfirmado?: string) => void;
  reagendarSolicitacao: (idOS: string, novaData: string, novoHorario: string, observacaoLogistica: string) => void;
  cancelarSolicitacao: (idOS: string, motivo: string) => void;
  filtrarSolicitacoes: (filtros: { status?: StatusSolicitacao, projetoId?: string, busca?: string }) => SolicitacaoTransporte[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoTransporte[]>(MOCK_SOLICITACOES);
  const [notificacoes, setNotificacoes] = useState<NotificacaoSimulada[]>([]);
  const [projetos] = useState<Projeto[]>(MOCK_PROJETOS);
  const [veiculos] = useState<Veiculo[]>(MOCK_VEICULOS);
  const [motoristas] = useState<Motorista[]>(MOCK_MOTORISTAS);

  const gerarNumeroOS = useCallback(() => {
    const ano = new Date().getFullYear();
    const count = solicitacoes.length + 1;
    return `OS-${ano}-${count.toString().padStart(4, '0')}`;
  }, [solicitacoes]);

  const criarSolicitacao = (dados: Omit<SolicitacaoTransporte, 'id' | 'numeroOS' | 'status' | 'dataSolicitacao'>) => {
    const novaSolicitacao: SolicitacaoTransporte = {
      ...dados,
      id: `SOL-${Date.now()}`,
      numeroOS: gerarNumeroOS(),
      status: 'pendente',
      dataSolicitacao: new Date().toISOString()
    };
    setSolicitacoes(prev => [novaSolicitacao, ...prev]);
  };

  const aprovarEAgendarSolicitacao = (idOS: string, veiculoId: string, motoristaId: string, horarioConfirmado?: string) => {
    const veiculo = veiculos.find(v => v.id === veiculoId);
    const motorista = motoristas.find(m => m.id === motoristaId);
    
    if (!veiculo || !motorista) return;

    setSolicitacoes(prev => prev.map(sol => {
      if (sol.numeroOS === idOS) {
        return {
          ...sol,
          status: 'agendada',
          veiculoAlocado: veiculo,
          motoristaAlocado: motorista,
          ...(horarioConfirmado && { horarioProgramado: horarioConfirmado })
        };
      }
      return sol;
    }));

    const novaNotif: NotificacaoSimulada = {
      id: `NOT-${Date.now()}`,
      mensagem: `A OS ${idOS} foi agendada. Motorista ${motorista.nome} e veículo ${veiculo.placa} alocados.`,
      data: new Date().toISOString(),
      lida: false,
      tipo: 'whatsapp'
    };
    setNotificacoes(prev => [novaNotif, ...prev]);
  };

  const reagendarSolicitacao = (idOS: string, novaData: string, novoHorario: string, observacaoLogistica: string) => {
    setSolicitacoes(prev => prev.map(sol => {
      if (sol.numeroOS === idOS) {
        return {
          ...sol,
          dataProgramada: novaData,
          horarioProgramado: novoHorario,
          observacaoLogistica: sol.observacaoLogistica 
            ? `${sol.observacaoLogistica}\n${observacaoLogistica}`
            : observacaoLogistica
        };
      }
      return sol;
    }));
  };

  const cancelarSolicitacao = (idOS: string, motivo: string) => {
    setSolicitacoes(prev => prev.map(sol => {
      if (sol.numeroOS === idOS) {
        return {
          ...sol,
          status: 'cancelada',
          motivoCancelamento: motivo
        };
      }
      return sol;
    }));
  };

  const filtrarSolicitacoes = (filtros: { status?: StatusSolicitacao, projetoId?: string, busca?: string }) => {
    return solicitacoes.filter(sol => {
      let matches = true;
      if (filtros.status && sol.status !== filtros.status) matches = false;
      if (filtros.projetoId && sol.projeto.id !== filtros.projetoId) matches = false;
      if (filtros.busca) {
        const query = filtros.busca.toLowerCase();
        if (!sol.numeroOS.toLowerCase().includes(query) && 
            !sol.tipoServico.toLowerCase().includes(query) &&
            !sol.destino.toLowerCase().includes(query)) {
          matches = false;
        }
      }
      return matches;
    });
  };

  return (
    <AppContext.Provider value={{
      solicitacoes,
      notificacoes,
      projetos,
      veiculos,
      motoristas,
      criarSolicitacao,
      aprovarEAgendarSolicitacao,
      reagendarSolicitacao,
      cancelarSolicitacao,
      filtrarSolicitacoes
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
