import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Search, Plus, MapPin, Truck } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { DataTable } from '../../components/common/DataTable';
import type { Veiculo, Motorista } from '../../types';

export const GestaoFrota = () => {
  const { veiculos, motoristas, solicitacoes } = useAppContext();
  const [activeTab, setActiveTab] = useState<'veiculos' | 'motoristas'>('veiculos');
  const [busca, setBusca] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const getOSAtual = (motoristaId: string) => {
    const os = solicitacoes.find(s => 
      s.motoristaAlocado?.id === motoristaId && 
      (s.status === 'em_execucao' || s.status === 'agendada')
    );
    return os ? os.numeroOS : null;
  };

  const filteredVeiculos = veiculos.filter(v => 
    v.placa.toLowerCase().includes(busca.toLowerCase()) || 
    v.modelo.toLowerCase().includes(busca.toLowerCase())
  );

  const filteredMotoristas = motoristas.filter(m => 
    m.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const columnsVeiculos = [
    {
      header: 'Identificação',
      render: (v: Veiculo) => (
        <div>
          <p className="font-bold text-slate-800">{v.modelo}</p>
          <p className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded mt-1 inline-block border border-slate-200">{v.placa}</p>
        </div>
      )
    },
    {
      header: 'Categoria',
      render: (v: Veiculo) => (
        <span className="flex items-center text-slate-600 font-medium">
          <Truck size={14} className="mr-2 text-slate-400" /> {v.tipo}
        </span>
      )
    },
    {
      header: 'Base',
      render: () => (
        <span className="flex items-center text-slate-600 font-medium">
          <MapPin size={14} className="mr-1 text-slate-400" /> Sedes
        </span>
      )
    },
    {
      header: 'Status',
      render: (v: Veiculo) => (
        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${
          v.status === 'disponivel' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          v.status === 'em_uso' ? 'bg-blue-50 text-blue-700 border-blue-200' :
          'bg-red-50 text-red-700 border-red-200'
        }`}>
          {v.status === 'disponivel' ? 'Disponível' : v.status === 'em_uso' ? 'Em Uso' : 'Manutenção'}
        </span>
      )
    },
    {
      header: '',
      align: 'right' as const,
      render: () => <button className="text-emerald-600 font-bold hover:text-emerald-700">Editar</button>
    }
  ];

  const columnsMotoristas = [
    {
      header: 'Motorista',
      render: (m: Motorista) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 font-bold mr-3 shadow-sm">
            {m.nome.charAt(0)}
          </div>
          <p className="font-bold text-slate-800">{m.nome}</p>
        </div>
      )
    },
    {
      header: 'Contato',
      accessor: 'telefone' as keyof Motorista,
      render: (m: Motorista) => <span className="font-mono text-slate-600 font-medium">{m.telefone}</span>
    },
    {
      header: 'Status Atual',
      render: (m: Motorista) => (
        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${
          m.status === 'disponivel' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          m.status === 'em_rota' ? 'bg-violet-50 text-violet-700 border-violet-200' :
          'bg-slate-100 text-slate-700 border-slate-300'
        }`}>
          {m.status === 'disponivel' ? 'Disponível' : m.status === 'em_rota' ? 'Em Rota' : 'Folga'}
        </span>
      )
    },
    {
      header: 'Vínculo (OS Ativa)',
      render: (m: Motorista) => {
        const osAtual = getOSAtual(m.id);
        return osAtual ? (
          <span className="font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-lg border border-violet-200 shadow-sm inline-flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mr-2 animate-pulse"></span> {osAtual}
          </span>
        ) : (
          <span className="text-slate-400 font-medium">-</span>
        )
      }
    },
    {
      header: '',
      align: 'right' as const,
      render: () => <button className="text-emerald-600 font-bold hover:text-emerald-700">Editar</button>
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Gestão de Frota e Motoristas</h2>
          <p className="text-slate-500 mt-1">Controle o cadastro e a disponibilidade de veículos e equipe.</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Plus size={18} className="mr-2" />
          {activeTab === 'veiculos' ? 'Novo Veículo' : 'Novo Motorista'}
        </button>
      </div>

      <div className="bg-white p-2 rounded-2xl shadow-soft border border-slate-200/80 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setActiveTab('veiculos')}
            className={`flex-1 md:flex-none px-6 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'veiculos' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Veículos ({veiculos.length})
          </button>
          <button
            onClick={() => setActiveTab('motoristas')}
            className={`flex-1 md:flex-none px-6 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'motoristas' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Motoristas ({motoristas.length})
          </button>
        </div>

        <div className="relative w-full md:w-96 px-4">
          <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-400" />
          </div>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder={activeTab === 'veiculos' ? "Buscar placa ou modelo..." : "Buscar nome..."}
            className="block w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 text-sm font-medium transition-all"
          />
        </div>
      </div>

      {activeTab === 'veiculos' ? (
        <DataTable columns={columnsVeiculos} data={filteredVeiculos} keyExtractor={v => v.id} />
      ) : (
        <DataTable columns={columnsMotoristas} data={filteredMotoristas} keyExtractor={m => m.id} />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Cadastrar ${activeTab === 'veiculos' ? 'Veículo' : 'Motorista'}`}>
        <div className="p-6 text-center text-slate-500">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus size={24} className="text-slate-400" />
          </div>
          <p className="font-bold text-slate-800 text-lg">Em construção</p>
          <p className="mt-2">O formulário de cadastro estará disponível na próxima versão do sistema.</p>
          <button 
            onClick={() => setModalOpen(false)}
            className="mt-6 w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </Modal>
    </div>
  );
};
