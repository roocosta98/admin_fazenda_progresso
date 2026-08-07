import { useState } from 'react';
import { 
  APIProvider, 
  Map as GoogleMap, 
  AdvancedMarker, 
  InfoWindow,
  useMap 
} from '@vis.gl/react-google-maps';
import { 
  MapPin, 
  Truck, 
  Navigation, 
  Navigation2, 
  Search, 
  AlertTriangle, 
  AlertCircle,
  Gauge,
  Fuel,
  User,
  ShieldAlert,
  Car,
  Layers,
  Map as MapIcon,
  CheckCircle2
} from 'lucide-react';

const GOOGLE_MAPS_API_KEY = 'AIzaSyAeQIKfNplzSj3wnUdIVBSnhzDb0OuFPwM';

// Centro aproximado da Fazenda Progresso em Mucugê / Chapada Diamantina - BA (-13.0047, -41.3708)
const FAZENDA_CENTER = { lat: -13.0047, lng: -41.3708 };

interface VeiculoTelemetria {
  id: string;
  numeroOS: string;
  veiculo: string;
  placa: string;
  tipo: 'Ônibus' | 'Caminhão' | 'Caçamba' | 'Pick-up' | 'Prancha' | 'Trator' | 'Comboio';
  motorista: string;
  origem: string;
  destino: string;
  velocidade: number; // km/h
  combustivel: number; // %
  rpm: number;
  progresso: number; // %
  status: 'online' | 'parado' | 'alerta' | 'concluido';
  mensagemAlerta?: string;
  ultimaComunicacao: string;
  position: { lat: number; lng: number };
}

// 12 Veículos simulados espalhados pela Fazenda Progresso com coordenadas reais (lat/lng) em torno de -13.0100, -41.3700
const VEICULOS_TELEMETRIA: VeiculoTelemetria[] = [
  {
    id: 'TEL-001',
    numeroOS: 'OS-2026-0001',
    veiculo: 'ONIBUS M.BENZ 1318',
    placa: 'BXE-7320',
    tipo: 'Ônibus',
    motorista: 'Antônio Silva',
    origem: 'Sede Central',
    destino: 'Pivô 04',
    velocidade: 45,
    combustivel: 82,
    rpm: 1800,
    progresso: 68,
    status: 'online',
    ultimaComunicacao: 'há 1 min',
    position: { lat: -13.0100, lng: -41.3700 }
  },
  {
    id: 'TEL-002',
    numeroOS: 'OS-2026-0002',
    veiculo: 'CAÇAMBA M.BENZ 1513',
    placa: 'CXU-6289',
    tipo: 'Caçamba',
    motorista: 'Pedro Santos',
    origem: 'Galpão Insumos',
    destino: 'Campo de Batata',
    velocidade: 0,
    combustivel: 45,
    rpm: 0,
    progresso: 85,
    status: 'parado',
    mensagemAlerta: 'Parada não programada no Pivô 02 (32 min)',
    ultimaComunicacao: 'há 12 min',
    position: { lat: -13.0030, lng: -41.3650 }
  },
  {
    id: 'TEL-003',
    numeroOS: 'OS-2026-0003',
    veiculo: 'ONIBUS M.BENZ 1620',
    placa: 'ICM-1818',
    tipo: 'Ônibus',
    motorista: 'José Oliveira',
    origem: 'Alojamento Leste',
    destino: 'Pivô 08 (Algodão)',
    velocidade: 52,
    combustivel: 91,
    rpm: 2100,
    progresso: 42,
    status: 'online',
    ultimaComunicacao: 'há 30 seg',
    position: { lat: -13.0180, lng: -41.3500 }
  },
  {
    id: 'TEL-004',
    numeroOS: 'OS-2026-0004',
    veiculo: 'CAMINHAO M.BENZ 1313',
    placa: 'IEU-7100',
    tipo: 'Caminhão',
    motorista: 'Marcos Costa',
    origem: 'Posto de Combustível',
    destino: 'Talhão 14 - Milho',
    velocidade: 64,
    combustivel: 18,
    rpm: 2350,
    progresso: 15,
    status: 'alerta',
    mensagemAlerta: 'Nível crítico de combustível (18%) & Desvio de Rota (+4km)',
    ultimaComunicacao: 'há 45 min',
    position: { lat: -13.0250, lng: -41.3850 }
  },
  {
    id: 'TEL-005',
    numeroOS: 'OS-2026-0005',
    veiculo: 'CAVALO MECANICO M.BENZ LS 1935',
    placa: 'ICY-0877',
    tipo: 'Prancha',
    motorista: 'Raimundo Nonato',
    origem: 'Sede Central',
    destino: 'Divisa Leste',
    velocidade: 38,
    combustivel: 75,
    rpm: 1650,
    progresso: 90,
    status: 'online',
    ultimaComunicacao: 'há 2 min',
    position: { lat: -13.0220, lng: -41.3450 }
  },
  {
    id: 'TEL-006',
    numeroOS: 'OS-2026-0006',
    veiculo: 'TOYOTA HILUX 4X4 AGRONOMIA',
    placa: 'JKL-9012',
    tipo: 'Pick-up',
    motorista: 'João - Técnico de Campo',
    origem: 'Escritório Central',
    destino: 'Pivô 01 (Semente)',
    velocidade: 58,
    combustivel: 88,
    rpm: 2000,
    progresso: 50,
    status: 'online',
    ultimaComunicacao: 'há 1 min',
    position: { lat: -13.0150, lng: -41.3750 }
  },
  {
    id: 'TEL-007',
    numeroOS: 'OS-2026-0007',
    veiculo: 'TRATOR JOHN DEERE 8335R',
    placa: 'MNO-3456',
    tipo: 'Trator',
    motorista: 'Carlos Eduardo',
    origem: 'Oficina Central',
    destino: 'Talhão 05',
    velocidade: 14,
    combustivel: 62,
    rpm: 1900,
    progresso: 35,
    status: 'online',
    ultimaComunicacao: 'há 4 min',
    position: { lat: -13.0300, lng: -41.3600 }
  },
  {
    id: 'TEL-008',
    numeroOS: 'OS-2026-0008',
    veiculo: 'COMBOIO MERCEDES BENZ 2726',
    placa: 'PQR-7890',
    tipo: 'Comboio',
    motorista: 'Fernando Ramos',
    origem: 'Base de Operações',
    destino: 'Pivô 06',
    velocidade: 30,
    combustivel: 95,
    rpm: 1750,
    progresso: 78,
    status: 'online',
    ultimaComunicacao: 'há 1 min',
    position: { lat: -13.0080, lng: -41.3800 }
  },
  {
    id: 'TEL-009',
    numeroOS: 'OS-2026-0009',
    veiculo: 'PRANCHA 3 EIXOS HEAVY DUTY',
    placa: 'ABC-1234',
    tipo: 'Prancha',
    motorista: 'Valter Ribeiro',
    origem: 'Almoxarifado',
    destino: 'Armazém Secundário',
    velocidade: 40,
    combustivel: 70,
    rpm: 1800,
    progresso: 60,
    status: 'online',
    ultimaComunicacao: 'há 3 min',
    position: { lat: -13.0060, lng: -41.3550 }
  },
  {
    id: 'TEL-010',
    numeroOS: 'OS-2026-0010',
    veiculo: 'CAMINHAO PIPA MB 1718',
    placa: 'DEF-9876',
    tipo: 'Caminhão',
    motorista: 'Luciano Lima',
    origem: 'Açude Principal',
    destino: 'Pivô 03',
    velocidade: 25,
    combustivel: 54,
    rpm: 1600,
    progresso: 28,
    status: 'online',
    ultimaComunicacao: 'há 5 min',
    position: { lat: -12.9980, lng: -41.3700 }
  },
  {
    id: 'TEL-011',
    numeroOS: 'OS-2026-0011',
    veiculo: 'TRATOR CASE IH MAGNUM 340',
    placa: 'GHI-5432',
    tipo: 'Trator',
    motorista: 'Gerson Oliveira',
    origem: 'Pivô 07',
    destino: 'Pivô 08',
    velocidade: 16,
    combustivel: 40,
    rpm: 2050,
    progresso: 70,
    status: 'online',
    ultimaComunicacao: 'há 2 min',
    position: { lat: -13.0120, lng: -41.3400 }
  },
  {
    id: 'TEL-012',
    numeroOS: 'OS-2026-0012',
    veiculo: 'PICK-UP MITSUBISHI L200',
    placa: 'JKL-1122',
    tipo: 'Pick-up',
    motorista: 'Bruno Souza',
    origem: 'Portaria Principal',
    destino: 'Campo Experimental',
    velocidade: 60,
    combustivel: 80,
    rpm: 2200,
    progresso: 95,
    status: 'online',
    ultimaComunicacao: 'há 1 min',
    position: { lat: -13.0040, lng: -41.3820 }
  },
  {
    id: 'TEL-013',
    numeroOS: 'OS-2026-0013',
    veiculo: 'ONIBUS M.BENZ 1721',
    placa: 'OKL-9988',
    tipo: 'Ônibus',
    motorista: 'Gabriel Santos',
    origem: 'Sede Mucugê',
    destino: 'Pivô Central',
    velocidade: 0,
    combustivel: 90,
    rpm: 0,
    progresso: 100,
    status: 'concluido',
    ultimaComunicacao: 'há 20 min',
    position: { lat: -13.0010, lng: -41.3680 }
  },
  {
    id: 'TEL-014',
    numeroOS: 'OS-2026-0014',
    veiculo: 'CAÇAMBA VOLVO VM 330',
    placa: 'MNC-4455',
    tipo: 'Caçamba',
    motorista: 'Renato Oliveira',
    origem: 'Talhão 09',
    destino: 'Armazém Secundário',
    velocidade: 0,
    combustivel: 68,
    rpm: 0,
    progresso: 100,
    status: 'concluido',
    ultimaComunicacao: 'há 35 min',
    position: { lat: -13.0150, lng: -41.3620 }
  }
];

// Componente para controlar a câmera do Google Maps suavemente ao focar num veículo
const MapController = ({ targetPosition }: { targetPosition: { lat: number; lng: number } | null }) => {
  const map = useMap();
  
  if (map && targetPosition) {
    map.panTo(targetPosition);
  }
  
  return null;
};

export const MapaMonitoramento = () => {
  const [selectedVeiculo, setSelectedVeiculo] = useState<VeiculoTelemetria | null>(VEICULOS_TELEMETRIA[0]);
  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos');
  const [exibirConcluidos, setExibirConcluidos] = useState<boolean>(true);
  const [mapTypeId, setMapTypeId] = useState<'hybrid' | 'roadmap' | 'terrain'>('hybrid');
  const [mapCenter, setMapCenter] = useState(FAZENDA_CENTER);

  // Centralizar no Veículo Selecionado
  const handleSelectVeiculo = (veiculo: VeiculoTelemetria) => {
    setSelectedVeiculo(veiculo);
    setMapCenter(veiculo.position);
  };

  // Filtros de Veículos
  const veiculosFiltrados = VEICULOS_TELEMETRIA.filter(v => {
    if (!exibirConcluidos && v.status === 'concluido') return false;

    const matchesBusca = 
      v.veiculo.toLowerCase().includes(busca.toLowerCase()) || 
      v.placa.toLowerCase().includes(busca.toLowerCase()) ||
      v.motorista.toLowerCase().includes(busca.toLowerCase()) ||
      v.numeroOS.toLowerCase().includes(busca.toLowerCase());
    
    const matchesTipo = tipoFiltro === 'todos' || v.tipo.toLowerCase() === tipoFiltro.toLowerCase();
    return matchesBusca && matchesTipo;
  });

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'Ônibus': return <User size={16} />;
      case 'Trator': return <Navigation2 size={16} />;
      case 'Pick-up': return <Car size={16} />;
      default: return <Truck size={16} />;
    }
  };

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <div className="absolute inset-0 z-0 bg-slate-100 overflow-hidden flex select-none text-slate-800">
        
        {/* GOOGLE MAPS COMPONENT */}
        <div className="w-full h-full relative">
          <GoogleMap
            defaultCenter={FAZENDA_CENTER}
            defaultZoom={13}
            mapTypeId={mapTypeId}
            mapId="FAZENDA_PROGRESSO_TELEMETRIA_MAP"
            gestureHandling="greedy"
            disableDefaultUI={true}
            className="w-full h-full"
          >
            <MapController targetPosition={mapCenter} />

            {/* MARCADORES GOOGLE MAPS DOS VEÍCULOS */}
            {veiculosFiltrados.map((v) => {
              const isSelected = selectedVeiculo?.id === v.id;
              
              let pinBg = 'bg-white border-emerald-600 text-emerald-700 shadow-lg';
              
              if (v.status === 'parado') {
                pinBg = 'bg-white border-amber-500 text-amber-700 shadow-lg';
              } else if (v.status === 'alerta') {
                pinBg = 'bg-white border-rose-600 text-rose-700 shadow-lg';
              } else if (v.status === 'concluido') {
                pinBg = 'bg-white border-blue-500 text-blue-700 shadow-lg opacity-80';
              }

              return (
                <AdvancedMarker
                  key={v.id}
                  position={v.position}
                  onClick={() => handleSelectVeiculo(v)}
                  zIndex={isSelected ? 100 : 10}
                >
                  <div className={`relative cursor-pointer transition-all duration-300 group ${
                    isSelected ? 'scale-125' : 'hover:scale-110'
                  }`}>
                    {/* Pulso de Sinal Vivo */}
                    <div className={`absolute inset-0 rounded-full animate-ping opacity-40 ${v.status === 'alerta' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>

                    {/* Marcador Principal Pin */}
                    <div className={`relative w-11 h-11 rounded-2xl flex items-center justify-center border-2 shadow-xl transition-all ${pinBg} ${
                      isSelected ? 'ring-8 ring-emerald-500/30 border-emerald-600 bg-emerald-50 scale-110' : 'hover:border-emerald-600'
                    }`}>
                      {getTipoIcon(v.tipo)}
                      
                      {/* Badge de Velocidade */}
                      <span className="absolute -top-2 -right-2 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-white shadow-md">
                        {v.velocidade}km/h
                      </span>
                    </div>

                    {/* Tooltip Hover */}
                    <div className="absolute top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xl whitespace-nowrap border border-slate-700 pointer-events-none z-50">
                      <p className="font-mono text-emerald-400">{v.placa}</p>
                      <p className="text-slate-300 text-[10px]">{v.veiculo}</p>
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* INFOWINDOW / BALÃO FLUTUANTE GOOGLE MAPS PARA O VEÍCULO SELECIONADO */}
            {selectedVeiculo && (
              <InfoWindow
                position={selectedVeiculo.position}
                onCloseClick={() => setSelectedVeiculo(null)}
                headerContent={
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {selectedVeiculo.numeroOS}
                    </span>
                    <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {selectedVeiculo.placa}
                    </span>
                  </div>
                }
              >
                <div className="w-64 p-1 text-slate-800 text-xs">
                  <h4 className="text-sm font-black text-slate-900 leading-tight mb-2">{selectedVeiculo.veiculo}</h4>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <span className="text-slate-500 flex items-center"><User size={12} className="mr-1 text-slate-400" /> Motorista:</span>
                      <span className="font-bold text-slate-900">{selectedVeiculo.motorista}</span>
                    </div>

                    <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <span className="text-slate-500 flex items-center"><Navigation size={12} className="mr-1 text-emerald-600" /> Rota:</span>
                      <span className="font-bold text-slate-800 truncate max-w-[120px]">{selectedVeiculo.origem} &rarr; {selectedVeiculo.destino}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <div className="bg-slate-50 p-1.5 rounded-lg flex items-center justify-between border border-slate-200">
                        <span className="text-slate-500 flex items-center text-[10px]"><Gauge size={12} className="mr-1 text-blue-600" /> Vel:</span>
                        <span className="font-mono font-bold text-slate-900 text-xs">{selectedVeiculo.velocidade} km/h</span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-lg flex items-center justify-between border border-slate-200">
                        <span className="text-slate-500 flex items-center text-[10px]"><Fuel size={12} className="mr-1 text-amber-600" /> Tanque:</span>
                        <span className="font-mono font-bold text-slate-900 text-xs">{selectedVeiculo.combustivel}%</span>
                      </div>
                    </div>

                    {/* Barra de Progresso do Percurso */}
                    <div className="pt-1">
                      <div className="flex justify-between text-[10px] font-bold mb-1">
                        <span className="text-slate-500">Progresso</span>
                        <span className="text-emerald-700 font-mono">{selectedVeiculo.progresso}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                        <div className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${selectedVeiculo.progresso}%` }}></div>
                      </div>
                    </div>

                    {/* Mensagem de Alerta */}
                    {selectedVeiculo.mensagemAlerta && (
                      <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-[10px] flex items-start space-x-1.5">
                        <AlertTriangle size={13} className="shrink-0 mt-0.5 text-rose-600" />
                        <span>{selectedVeiculo.mensagemAlerta}</span>
                      </div>
                    )}
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>

        {/* PAINEL CLARO FLUTUANTE DE CONTROLES DO GOOGLE MAPS (SUPERIOR ESQUERDO) */}
        <div className="absolute top-8 left-6 z-30 flex flex-col space-y-3 pointer-events-auto">
          <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-slate-200/80 flex items-center space-x-2">
            <div className="flex items-center space-x-1 px-2 py-1 bg-emerald-50 text-emerald-800 rounded-xl font-bold text-xs border border-emerald-200">
              <MapIcon size={14} className="mr-1 text-emerald-600" />
              <span>Google Maps Activo</span>
            </div>

            <div className="h-6 w-px bg-slate-200 mx-1"></div>

            {/* Seletor de Camadas Google Maps */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button 
                onClick={() => setMapTypeId('hybrid')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center ${mapTypeId === 'hybrid' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <Layers size={13} className="mr-1.5" /> Satélite / Híbrido
              </button>
              <button 
                onClick={() => setMapTypeId('terrain')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${mapTypeId === 'terrain' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Relevo / Topografia
              </button>
              <button 
                onClick={() => setMapTypeId('roadmap')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${mapTypeId === 'roadmap' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Vetor / Vias
              </button>
            </div>
          </div>

          {/* Indicador de Status Geral */}
          <div className="flex items-center px-4 py-2 bg-white/90 backdrop-blur-md text-emerald-700 rounded-xl font-bold text-xs border border-slate-200/80 shadow-lg w-fit">
            <Navigation2 size={14} className="mr-2 animate-pulse text-emerald-600" /> 
            Telemetria Fazenda Progresso (12 Veículos Conectados)
          </div>
        </div>

        {/* PAINEL LATERAL DIREITO CLARO (FROTA EM TRÂNSITO) */}
        <div className="absolute right-6 top-8 bottom-6 w-96 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col z-30 overflow-hidden pointer-events-auto">
          
          {/* Cabeçalho do Painel Lateral */}
          <div className="p-5 pt-6 border-b border-slate-100 bg-white/90">
            <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center">
              <Truck className="mr-2.5 text-emerald-600" size={20} /> Frota em Telemetria
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">Acompanhamento e alertas GPS em tempo real</p>
          </div>

          {/* Filtro de Busca & Abas */}
          <div className="p-4 border-b border-slate-100 space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar placa, veículo ou motorista..." 
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium" 
              />
            </div>

            <div className="flex overflow-x-auto space-x-1.5 pb-1 scrollbar-none">
              {['todos', 'ônibus', 'caminhão', 'caçamba', 'pick-up', 'prancha', 'trator'].map(tipo => (
                <button
                  key={tipo}
                  onClick={() => setTipoFiltro(tipo)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg capitalize whitespace-nowrap transition-colors ${
                    tipoFiltro === tipo 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800 bg-slate-100'
                  }`}
                >
                  {tipo}
                </button>
              ))}
            </div>

            {/* Chave Seletora: Exibir / Ocultar Viagens Concluídas */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-xs">
              <span className="font-bold text-slate-700">Exibir Viagens Concluídas</span>
              <button
                type="button"
                onClick={() => setExibirConcluidos(!exibirConcluidos)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${exibirConcluidos ? 'bg-emerald-600' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${exibirConcluidos ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {/* Lista de Veículos & Alertas Claros */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* Seção de Alertas Críticos */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Alertas Ativos</h4>
              
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex items-start space-x-3 shadow-sm">
                <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Caçamba M.Benz (CXU-6289)</p>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">Parada prolongada no Pivô 02 (32 min).</p>
                  <button 
                    onClick={() => handleSelectVeiculo(VEICULOS_TELEMETRIA[1])}
                    className="text-[11px] font-bold text-amber-700 mt-1.5 hover:underline flex items-center"
                  >
                    Focar no mapa &rarr;
                  </button>
                </div>
              </div>

              <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl flex items-start space-x-3 shadow-sm">
                <ShieldAlert size={18} className="text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Caminhão M.Benz (IEU-7100)</p>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">Combustível crítico (18%) & 45 min sem sinal.</p>
                  <button 
                    onClick={() => handleSelectVeiculo(VEICULOS_TELEMETRIA[3])}
                    className="text-[11px] font-bold text-rose-700 mt-1.5 hover:underline flex items-center"
                  >
                    Focar no mapa &rarr;
                  </button>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100 w-full"></div>

            {/* Lista de Veículos Cadastrados (Exibe 3 veículos por vez, com scroll) */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                Veículos Conectados ({veiculosFiltrados.length})
              </h4>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-300">
                {veiculosFiltrados.map(v => {
                const isSelected = selectedVeiculo?.id === v.id;
                
                return (
                  <div 
                    key={v.id} 
                    onClick={() => handleSelectVeiculo(v)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-emerald-500 bg-emerald-50/70 shadow-md ring-1 ring-emerald-500/20' 
                        : 'border-slate-200/80 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-mono font-bold text-emerald-700 text-xs">{v.numeroOS}</span>
                      
                      {v.status === 'online' && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold border border-emerald-200 flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span> Online
                        </span>
                      )}
                      {v.status === 'parado' && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold border border-amber-200 flex items-center">
                          <AlertCircle size={10} className="mr-1" /> Parado
                        </span>
                      )}
                      {v.status === 'alerta' && (
                        <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold border border-rose-200 flex items-center">
                          <AlertTriangle size={10} className="mr-1" /> Alerta
                        </span>
                      )}
                      {v.status === 'concluido' && (
                        <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold border border-blue-200 flex items-center">
                          <CheckCircle2 size={10} className="mr-1" /> Concluído
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-bold text-slate-800 truncate">{v.veiculo}</p>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">{v.motorista} • <span className="text-slate-700 font-mono">{v.placa}</span></p>

                    <div className="flex justify-between items-center text-[11px] font-medium border-t border-slate-100 pt-2.5 mt-2.5">
                      <span className="text-slate-500 flex items-center"><MapPin size={11} className="mr-1 text-emerald-600" /> {v.destino}</span>
                      <span className="font-mono text-emerald-700 font-bold">{v.velocidade} km/h</span>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </APIProvider>
  );
};
