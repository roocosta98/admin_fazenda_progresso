import { useState } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { Truck, MapPin, Calendar, Clock, Briefcase, FileText, CheckCircle2, Navigation, Zap, User } from 'lucide-react';
import { Modal } from '../../../components/common/Modal';
import { SlideOverDrawer } from '../../../components/common/SlideOverDrawer';

interface NovaSolicitacaoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NovaSolicitacaoDrawer = ({ isOpen, onClose, onSuccess }: NovaSolicitacaoDrawerProps) => {
  const { criarSolicitacao, projetos } = useAppContext();
  const { usuario } = useAuth();
  
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    solicitanteNome: usuario?.nome || '',
    tipoServico: '',
    origem: '',
    destino: '',
    dataProgramada: '',
    horarioProgramado: '',
    projetoId: '',
    observacoes: ''
  });

  // Atualiza o nome se o usuario carregar depois
  import { useEffect } from 'react';
  useEffect(() => {
    if (usuario?.nome && !formData.solicitanteNome) {
      setFormData(prev => ({...prev, solicitanteNome: usuario.nome}));
    }
  }, [usuario]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario) return;

    const projeto = projetos.find(p => p.id === formData.projetoId);
    if (!projeto) return;

    setIsLoading(true);

    // Simulate API delay for loading state
    setTimeout(() => {
      criarSolicitacao({
        solicitante: {
          id: usuario.id,
          nome: formData.solicitanteNome, // Usando o nome do formulário
          perfil: usuario.perfil,
          departamento: usuario.departamento
        },
        tipoServico: formData.tipoServico,
        origem: formData.origem,
        destino: formData.destino,
        dataProgramada: formData.dataProgramada,
        horarioProgramado: formData.horarioProgramado,
        projeto,
        observacoes: formData.observacoes
      });
      
      setIsLoading(false);
      setSuccessModalOpen(true);
    }, 800);
  };

  const handleFinish = () => {
    setSuccessModalOpen(false);
    
    // Reset form
    setFormData({
      solicitanteNome: usuario?.nome || '',
      tipoServico: '',
      origem: '',
      destino: '',
      dataProgramada: '',
      horarioProgramado: '',
      projetoId: '',
      observacoes: ''
    });
    
    onSuccess();
    onClose();
  };

  return (
    <>
      <SlideOverDrawer isOpen={isOpen} onClose={onClose} title="Nova Solicitação de Transporte" width="max-w-xl">
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 relative before:absolute before:top-1/2 before:-translate-y-1/2 before:left-0 before:w-full before:h-0.5 before:bg-slate-100 z-0 px-4">
          <div className="relative z-10 flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-md ring-4 ring-white">1</div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider absolute -bottom-5 whitespace-nowrap">Veículo</span>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-md ring-4 ring-white">2</div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider absolute -bottom-5 whitespace-nowrap">Rota</span>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-md ring-4 ring-white">3</div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider absolute -bottom-5 whitespace-nowrap">Custo</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 pb-6 mt-10">
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
              <Truck size={20} className="text-emerald-600" />
              <h3 className="text-base font-bold text-slate-800">Selecione o Veículo/Serviço</h3>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['Prancha', 'Caçamba', 'Ônibus', 'Pick-up', 'Comboio', 'Trator', 'Insumos'].map((tipo) => (
                <label 
                  key={tipo} 
                  className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 group overflow-hidden ${
                    formData.tipoServico === tipo 
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-500/10 scale-[1.02]' 
                      : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50 hover:shadow-sm bg-white'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="tipoServico" 
                    value={tipo} 
                    className="hidden"
                    checked={formData.tipoServico === tipo}
                    onChange={(e) => setFormData({...formData, tipoServico: e.target.value})}
                    required
                  />
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${formData.tipoServico === tipo ? 'bg-emerald-500 text-white shadow-inner' : 'bg-slate-100 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600'}`}>
                    <Truck size={24} />
                  </div>
                  <span className={`font-bold text-sm ${formData.tipoServico === tipo ? 'text-emerald-800' : 'text-slate-600'}`}>{tipo}</span>
                  
                  {formData.tipoServico === tipo && (
                    <div className="absolute top-2 right-2 text-emerald-500">
                      <CheckCircle2 size={16} className="fill-emerald-100" />
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
              <Navigation size={20} className="text-blue-600" />
              <h3 className="text-base font-bold text-slate-800">Rota e Agendamento</h3>
            </div>

            <div className="space-y-5 bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
              <div className="group/input">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide flex items-center">
                  <User size={14} className="mr-1.5" /> Solicitante
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    className="w-full pl-4 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all bg-white text-sm shadow-sm font-medium text-slate-700"
                    value={formData.solicitanteNome}
                    onChange={(e) => setFormData({...formData, solicitanteNome: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="group/input">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Origem</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin size={16} className="text-slate-400 group-focus-within/input:text-emerald-500 transition-colors" />
                    </div>
                    <select
                      required
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all bg-white text-sm shadow-sm appearance-none"
                      value={formData.origem}
                      onChange={(e) => setFormData({...formData, origem: e.target.value})}
                    >
                      <option value="">Selecione a origem...</option>
                      <option value="Fazenda Progresso - Sede">Fazenda Progresso - Sede</option>
                      <option value="Lote 22 / Campo 4">Lote 22 / Campo 4</option>
                      <option value="Silo Principal">Silo Principal</option>
                      <option value="Armazém de Defensivos">Armazém de Defensivos</option>
                      <option value="Oficina Central">Oficina Central</option>
                    </select>
                  </div>
                </div>
                <div className="group/input">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Destino</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin size={16} className="text-slate-400 group-focus-within/input:text-rose-500 transition-colors" />
                    </div>
                    <select
                      required
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all bg-white text-sm shadow-sm appearance-none"
                      value={formData.destino}
                      onChange={(e) => setFormData({...formData, destino: e.target.value})}
                    >
                      <option value="">Selecione o destino...</option>
                      <option value="Fazenda Progresso - Sede">Fazenda Progresso - Sede</option>
                      <option value="Lote 22 / Campo 4">Lote 22 / Campo 4</option>
                      <option value="Silo Principal">Silo Principal</option>
                      <option value="Armazém de Defensivos">Armazém de Defensivos</option>
                      <option value="Oficina Central">Oficina Central</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="group/input">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Data Desejada</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar size={16} className="text-slate-400 group-focus-within/input:text-emerald-500 transition-colors" />
                    </div>
                    <input
                      type="date"
                      required
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all bg-white text-sm shadow-sm font-medium text-slate-700"
                      value={formData.dataProgramada}
                      onChange={(e) => setFormData({...formData, dataProgramada: e.target.value})}
                    />
                  </div>
                </div>
                <div className="group/input">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Horário Desejado <span className="text-[10px] text-slate-400 normal-case block mt-0.5">* Guia de planejamento para a logística</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock size={16} className="text-slate-400 group-focus-within/input:text-emerald-500 transition-colors" />
                    </div>
                    <input
                      type="time"
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all bg-white text-sm shadow-sm font-medium text-slate-700"
                      value={formData.horarioProgramado}
                      onChange={(e) => setFormData({...formData, horarioProgramado: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
              <Briefcase size={20} className="text-amber-600" />
              <h3 className="text-base font-bold text-slate-800">Apropriação de Custo</h3>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Projeto / Centro de Custo</label>
                <select
                  required
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all bg-white text-sm shadow-sm font-medium appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.2em] bg-[right_1rem_center] bg-no-repeat"
                  value={formData.projetoId}
                  onChange={(e) => setFormData({...formData, projetoId: e.target.value})}
                >
                  <option value="">Selecione o projeto...</option>
                  {projetos.map(p => (
                    <option key={p.id} value={p.id}>{p.nome} ({p.centroCusto})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide flex items-center"><FileText size={14} className="mr-1.5" /> Observação (Obrigatória)</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Instruções específicas para o motorista, cargas especiais..."
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all bg-white text-sm resize-none shadow-sm"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                ></textarea>
              </div>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-slate-100 flex justify-end items-center sticky bottom-0 bg-white py-4 z-20">
            <button
              type="button"
              onClick={onClose}
              className="mr-3 px-6 py-3 rounded-xl font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-8 py-3 rounded-xl font-bold hover:from-emerald-500 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/30 flex items-center hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </div>
              ) : (
                <>
                  Integrar Sankhya e Confirmar <Zap size={18} className="ml-2 group-hover:animate-pulse" />
                </>
              )}
            </button>
          </div>
        </form>
      </SlideOverDrawer>

      <Modal isOpen={successModalOpen} onClose={handleFinish} title="Integração Concluída!">
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
            <CheckCircle2 size={40} className="relative z-10" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-2">OS Gerada com Sucesso!</h3>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
            Sua solicitação foi registrada e enviada para a fila de planejamento da logística (Integrado via Sankhya).
          </p>
          <button
            onClick={handleFinish}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg flex items-center justify-center"
          >
            Acompanhar Pedido
          </button>
        </div>
      </Modal>
    </>
  );
};
