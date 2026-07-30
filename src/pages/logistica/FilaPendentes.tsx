import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { StatCard } from '../../components/common/StatCard';
import { DataTable } from '../../components/common/DataTable';
import { AprovarSolicitacaoDrawer } from './components/AprovarSolicitacaoDrawer';
import { Clock, Calendar, Truck, User as UserIcon, Search, CheckCircle2 } from 'lucide-react';
import type { SolicitacaoTransporte } from '../../types';

export const FilaPendentes = () => {
  const { solicitacoes, veiculos, motoristas } = useAppContext();
  
  const pendentes = solicitacoes.filter(s => s.status === 'pendente');
  const agendadasHoje = solicitacoes.filter(s => s.status === 'agendada' && s.dataProgramada === new Date().toISOString().split('T')[0]);
  const veiculosLivres = veiculos.filter(v => v.status === 'disponivel').length;
  const motoristasLivres = motoristas.filter(m => m.status === 'disponivel').length;

  const [busca, setBusca] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [solicitacaoEmAnalise, setSolicitacaoEmAnalise] = useState<SolicitacaoTransporte | null>(null);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAnalise = (solicitacao: SolicitacaoTransporte) => {
    setSolicitacaoEmAnalise(solicitacao);
    setDrawerOpen(true);
  };

  const handleSuccess = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 5000); 
  };

  const filteredPendentes = pendentes.filter(s => 
    s.numeroOS.toLowerCase().includes(busca.toLowerCase()) || 
    s.tipoServico.toLowerCase().includes(busca.toLowerCase()) ||
    s.projeto.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const columns = [
    {
      header: 'OS',
      accessor: 'numeroOS' as keyof SolicitacaoTransporte,
      render: (row: SolicitacaoTransporte) => (
        <div>
          <span className="font-bold text-slate-800">{row.numeroOS}</span>
          <div className="mt-1"><StatusBadge status={row.status} /></div>
        </div>
      )
    },
    {
      header: 'Solicitante',
      render: (row: SolicitacaoTransporte) => (
        <div>
          <div className="font-bold text-slate-800">{row.solicitante.nome}</div>
          <div className="text-xs text-slate-500">{row.solicitante.departamento}</div>
        </div>
      )
    },
    {
      header: 'Serviço & Rota',
      render: (row: SolicitacaoTransporte) => (
        <div>
          <div className="font-medium text-slate-800 flex items-center">
            <Truck size={14} className="mr-1 text-emerald-600" /> {row.tipoServico}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {row.origem} &rarr; {row.destino}
          </div>
        </div>
      )
    },
    {
      header: 'Projeto',
      render: (row: SolicitacaoTransporte) => (
        <div>
          <div className="text-sm font-medium text-slate-800">{row.projeto.nome}</div>
          <div className="text-xs text-slate-500 mt-0.5">{row.projeto.centroCusto}</div>
        </div>
      )
    },
    {
      header: 'Data / Hora',
      render: (row: SolicitacaoTransporte) => (
        <div>
          <div className="text-sm text-slate-800 font-medium">
            {row.dataProgramada ? new Date(row.dataProgramada).toLocaleDateString('pt-BR') : '-'}
          </div>
          {row.horarioProgramado && (
            <div className="text-xs text-slate-500 mt-0.5 flex items-center">
              <Clock size={12} className="mr-1" /> {row.horarioProgramado}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Ação',
      align: 'right' as const,
      render: (row: SolicitacaoTransporte) => (
        <button
          onClick={(e) => { e.stopPropagation(); handleAnalise(row); }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
        >
          Analisar
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 animate-fade-in-up border border-slate-700">
          <CheckCircle2 className="text-emerald-400" />
          <span className="font-medium tracking-wide">{toastMessage}</span>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Fila de Aprovação Operacional</h2>
        <p className="text-slate-500 mt-1">Gerencie, aprove e aloque recursos para os chamados pendentes.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pendentes" value={pendentes.length} icon={<Clock size={24} />} colorClass="text-amber-600 bg-amber-500" />
        <StatCard title="Agendadas (Hoje)" value={agendadasHoje.length} icon={<Calendar size={24} />} colorClass="text-blue-600 bg-blue-500" />
        <StatCard title="Veículos Livres" value={veiculosLivres} icon={<Truck size={24} />} colorClass="text-emerald-600 bg-emerald-500" />
        <StatCard title="Motoristas Livres" value={motoristasLivres} icon={<UserIcon size={24} />} colorClass="text-indigo-600 bg-indigo-500" />
      </div>

      <div className="bg-white p-2 rounded-2xl shadow-soft border border-slate-200/80 flex items-center">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por OS, serviço ou projeto..."
            className="block w-full pl-11 pr-4 py-3 border-none bg-transparent focus:ring-0 text-slate-800 placeholder-slate-400 font-medium"
          />
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={filteredPendentes} 
        keyExtractor={(row) => row.id}
        onRowClick={handleAnalise}
        emptyMessage="Fila Limpa! Não há solicitações pendentes no momento."
      />

      <AprovarSolicitacaoDrawer 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        solicitacao={solicitacaoEmAnalise} 
        onSuccess={handleSuccess}
      />
    </div>
  );
};
