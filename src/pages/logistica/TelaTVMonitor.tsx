import { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Truck, MapPin } from 'lucide-react';

export const TelaTVMonitor = () => {
  const { solicitacoes } = useAppContext();
  const emExecucao = solicitacoes.filter(s => s.status === 'em_execucao');
  
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 flex flex-col font-sans selection:bg-emerald-500/30">
      <header className="flex justify-between items-end border-b border-slate-800 pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">MONITOR DE FROTA <span className="text-emerald-500">AO VIVO</span></h1>
          <p className="text-slate-400 mt-2 text-xl font-medium">Fazenda Progresso - Operações Logísticas</p>
        </div>
        <div className="text-right">
          <p className="text-5xl font-bold text-white tabular-nums tracking-tighter">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-emerald-500 font-bold uppercase tracking-widest mt-1 text-sm">Atualizado em tempo real</p>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1 auto-rows-max">
        {emExecucao.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-50">
            <Truck size={80} className="mb-6 text-slate-700" />
            <p className="text-3xl font-bold text-slate-500">Nenhuma viagem em execução no momento.</p>
          </div>
        ) : (
          emExecucao.map(sol => (
            <div key={sol.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full blur-3xl pointer-events-none"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm font-black tracking-widest uppercase shadow-sm">Em Rota</span>
                  <h2 className="text-5xl font-black text-white mt-4 tracking-tighter">{sol.numeroOS}</h2>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 uppercase text-xs font-bold tracking-widest mb-1">Solicitante</p>
                  <p className="text-2xl font-bold text-slate-300">{sol.solicitante.nome}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                  <div className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center mr-5 shrink-0 border border-slate-700">
                    <Truck size={28} className="text-slate-300" />
                  </div>
                  <div>
                    <p className="text-slate-500 uppercase text-xs font-bold tracking-widest mb-1">Veículo & Motorista</p>
                    <p className="text-2xl font-bold text-white">{sol.veiculoAlocado?.modelo} <span className="text-slate-600 font-normal mx-2">|</span> {sol.motoristaAlocado?.nome}</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                  <div className="w-14 h-14 bg-emerald-950/30 rounded-xl flex items-center justify-center mr-5 shrink-0 border border-emerald-900/50">
                    <MapPin size={28} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-slate-500 uppercase text-xs font-bold tracking-widest mb-1">Rota</p>
                    <p className="text-xl font-bold text-white truncate max-w-[600px]">{sol.origem} <span className="text-emerald-500 mx-2">&rarr;</span> {sol.destino}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
