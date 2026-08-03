import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { MapPin, Truck, Navigation, Navigation2, Search, Crosshair, AlertTriangle, AlertCircle } from 'lucide-react';
import type { SolicitacaoTransporte } from '../../types';

export const MapaMonitoramento = () => {
  const { solicitacoes } = useAppContext();
  
  const emExecucao = solicitacoes.filter(s => s.status === 'em_execucao');
  const [selectedOS, setSelectedOS] = useState<SolicitacaoTransporte | null>(null);

  const getFakedCoordinates = (osId: string) => {
    const hash = osId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const top = 20 + (hash % 60); 
    const left = 20 + ((hash * 3) % 60);
    return { top: `${top}%`, left: `${left}%` };
  };

  return (
    <div className="absolute inset-0 z-0 bg-slate-100 overflow-hidden flex">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-[#e2e8f0] opacity-80 pointer-events-none"></div>
      <div className="absolute inset-0 opacity-40 pointer-events-none mix-blend-multiply">
        <svg width="100%" height="100%">
          <path d="M-100,200 Q300,50 600,400 T1200,200 T1800,500" stroke="#059669" strokeWidth="12" fill="none" strokeDasharray="15 15" />
          <path d="M200,800 Q500,600 800,300 T1400,600" stroke="#3b82f6" strokeWidth="8" fill="none" opacity="0.5" />
          <circle cx="30%" cy="40%" r="250" fill="#10b981" opacity="0.15" />
          <circle cx="75%" cy="70%" r="300" fill="#10b981" opacity="0.15" />
          <circle cx="85%" cy="25%" r="150" fill="#3b82f6" opacity="0.1" />
        </svg>
      </div>

      <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-glass border border-white/50 flex space-x-2">
        <button className="p-2.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 rounded-lg transition-colors" title="Centralizar Mapa">
          <Crosshair size={20} />
        </button>
        <div className="flex items-center px-4 bg-emerald-50 text-emerald-700 rounded-lg font-bold text-sm border border-emerald-100">
          <Navigation2 size={16} className="mr-2 animate-pulse" /> Telemetria Online
        </div>
      </div>

      <div className="absolute inset-0 z-10">
        {emExecucao.map(sol => {
          const coords = getFakedCoordinates(sol.id);
          const isSelected = selectedOS?.id === sol.id;
          
          return (
            <div 
              key={sol.id}
              className={`absolute w-12 h-12 -ml-6 -mt-6 rounded-full flex items-center justify-center cursor-pointer shadow-lg transform transition-all duration-300 ${isSelected ? 'scale-125 z-30 bg-emerald-600 text-white ring-8 ring-emerald-500/20' : 'bg-white text-emerald-600 border-4 border-emerald-500 hover:scale-110 z-20'}`}
              style={{ top: coords.top, left: coords.left }}
              onClick={() => setSelectedOS(sol)}
            >
              <Truck size={20} />
              
              {isSelected && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white p-5 text-left animate-fade-in-up">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 border-[12px] border-transparent border-b-white"></div>
                  
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-bold text-slate-900 text-base">{sol.numeroOS}</span>
                    <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">{sol.veiculoAlocado?.placa}</span>
                  </div>
                  
                  {(() => {
                    const status = sol.indicadorComunicacao?.status || (Math.random() > 0.8 ? 'alerta' : 'online');
                    const time = sol.indicadorComunicacao?.ultimaComunicacao || (status === 'alerta' ? 'há 45 min' : 'há 2 min');
                    return (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-slate-700 flex items-center"><Navigation size={14} className="mr-2 text-slate-400" /> {sol.origem} &rarr; {sol.destino}</p>
                        <p className="text-sm font-medium text-slate-700 flex items-center"><Truck size={14} className="mr-2 text-emerald-500" /> {sol.veiculoAlocado?.modelo}</p>
                        
                        <div className="mt-4 pt-4 border-t border-slate-200/60">
                          <div className="flex justify-between text-xs font-bold mb-1.5">
                            <span className="text-slate-500">Progresso</span>
                            <span className="text-emerald-600">65%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
                            <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-2 rounded-full relative" style={{ width: '65%' }}>
                               <div className="absolute top-0 right-0 bottom-0 w-2 bg-white/50 animate-ping rounded-full"></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-100">
                          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">62 km/h</span>
                          {status === 'online' ? (
                            <span className="text-[10px] font-bold text-emerald-600 flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span> Último ping: {time}</span>
                          ) : (
                            <span className="text-[10px] font-bold text-rose-600 flex items-center"><AlertTriangle size={10} className="mr-1" /> Alerta: {time} sem comunicação</span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="absolute right-6 top-6 bottom-6 w-96 bg-white/80 backdrop-blur-2xl rounded-3xl shadow-glass border border-white/60 flex flex-col z-40 overflow-hidden">
        <div className="p-6 border-b border-white/60 bg-white/50">
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">Frota em Trânsito</h3>
          <p className="text-sm text-slate-500 font-medium mt-1">Acompanhamento e alertas em tempo real</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Alertas de Telemetria</h4>
            
            <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl flex items-start space-x-3 shadow-sm">
              <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-slate-800">Prancha Volvo (ABC-1234)</p>
                <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">Parada prolongada identificada no Lote 14 (35 min).</p>
                <button className="text-xs font-bold text-amber-700 mt-2 hover:underline">Focar no mapa</button>
              </div>
            </div>

            <div className="bg-red-50/80 border border-red-200 p-4 rounded-2xl flex items-start space-x-3 shadow-sm">
              <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-slate-800">Fiat Strada (GHI-9012)</p>
                <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">Desvio de rota detectado (+8 km do trajeto programado).</p>
                <button className="text-xs font-bold text-red-700 mt-2 hover:underline">Intervir</button>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-200/60 w-full"></div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Veículos ({emExecucao.length})</h4>
            
            <div className="relative mb-3 px-1">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Buscar veículo..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm" />
            </div>

            <div className="space-y-2 px-1">
              {emExecucao.map(sol => {
                const status = sol.indicadorComunicacao?.status || (Math.random() > 0.8 ? 'alerta' : 'online');
                return (
                <div 
                  key={sol.id} 
                  onClick={() => setSelectedOS(sol)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedOS?.id === sol.id ? 'border-emerald-500 bg-white shadow-md ring-2 ring-emerald-500/10' : 'border-slate-200/60 bg-white/50 hover:bg-white hover:shadow-sm'}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-800 text-sm">{sol.numeroOS}</span>
                    {status === 'online' ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span> Online
                      </span>
                    ) : (
                      <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold flex items-center">
                        <AlertTriangle size={10} className="mr-1" /> Alerta
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 font-medium mb-3 truncate">{sol.veiculoAlocado?.modelo} • <span className="text-slate-500">{sol.motoristaAlocado?.nome}</span></p>
                  
                  <div className="flex justify-between items-center text-xs font-medium border-t border-slate-100 pt-3">
                    <span className="text-slate-500 flex items-center"><MapPin size={12} className="mr-1 text-slate-400" /> {sol.destino}</span>
                    <span className="font-mono text-slate-400">{sol.veiculoAlocado?.placa}</span>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
