import { useState, useRef } from 'react';
import { 
  MapPin, 
  Truck, 
  Navigation, 
  Navigation2, 
  Search, 
  AlertTriangle, 
  AlertCircle,
  Plus,
  Minus,
  RotateCcw,
  Gauge,
  Fuel,
  User,
  ShieldAlert,
  Car
} from 'lucide-react';

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
  status: 'online' | 'parado' | 'alerta';
  mensagemAlerta?: string;
  ultimaComunicacao: string;
  coords: { x: number; y: number }; // Porcentagem no mapa (0-100)
}

// 12 Veículos simulados espalhados pela Fazenda Progresso
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
    coords: { x: 38, y: 32 }
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
    coords: { x: 55, y: 24 }
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
    coords: { x: 78, y: 48 }
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
    coords: { x: 22, y: 65 }
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
    coords: { x: 84, y: 72 }
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
    coords: { x: 42, y: 58 }
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
    coords: { x: 62, y: 80 }
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
    coords: { x: 30, y: 44 }
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
    coords: { x: 70, y: 35 }
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
    coords: { x: 48, y: 18 }
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
    coords: { x: 88, y: 38 }
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
    progresso: 82,
    status: 'online',
    ultimaComunicacao: 'há 1 min',
    coords: { x: 15, y: 35 }
  }
];

export const MapaMonitoramento = () => {
  const [selectedVeiculo, setSelectedVeiculo] = useState<VeiculoTelemetria | null>(VEICULOS_TELEMETRIA[0]);
  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos');
  const [mapaTipo, setMapaTipo] = useState<'satelite' | 'topografico' | 'vetorial'>('satelite');

  // Estado do Mapa Interativo (Pan & Zoom)
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Manipulação de Arrastar (Pan)
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.no-drag')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom via Scroll da Roda do Mouse
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    setZoom(prevZoom => Math.min(Math.max(prevZoom * zoomFactor, 0.6), 3.0));
  };

  // Controles de Zoom
  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.25, 3.0));
  const handleZoomOut = () => setZoom(prev => Math.min(prev / 1.25, 0.6));
  const handleResetMap = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedVeiculo(VEICULOS_TELEMETRIA[0]);
  };

  // Centralizar no Veículo Selecionado
  const handleSelectVeiculo = (veiculo: VeiculoTelemetria) => {
    setSelectedVeiculo(veiculo);
    const targetX = (50 - veiculo.coords.x) * 8 * zoom;
    const targetY = (50 - veiculo.coords.y) * 6 * zoom;
    setPan({ x: targetX, y: targetY });
  };

  // Filtros de Veículos
  const veiculosFiltrados = VEICULOS_TELEMETRIA.filter(v => {
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
    <div className="absolute inset-0 z-0 bg-slate-100 overflow-hidden flex select-none text-slate-800">
      
      {/* MAPA INTERATIVO CLARO (CANVAS DE ARRASTAR E DAR ZOOM) */}
      <div 
        ref={mapContainerRef}
        className={`relative w-full h-full overflow-hidden transition-cursor ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Camada do Mapa Transformada (Clara) */}
        <div 
          className="w-full h-full relative transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center'
          }}
        >
          {/* Fundo do Mapa Agro Limpo e Claro */}
          <div className="absolute inset-[-50%] w-[200%] h-[200%] bg-[#EBF1F5]">
            
            {/* Textura de Fundo Agrícola Claro */}
            {mapaTipo === 'satelite' && (
              <div className="absolute inset-0 opacity-80 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:32px_32px]">
                {/* SVG Desenho dos Pivôs Centrais e Talhões Agrícolas da Fazenda Progresso */}
                <svg width="100%" height="100%" className="opacity-90">
                  <defs>
                    <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                      <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#CBD5E1" strokeWidth="1" />
                    </pattern>
                  </defs>

                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Rotas de Vicinais da Fazenda */}
                  <path d="M200,400 Q600,150 1200,500 T2200,300" stroke="#059669" strokeWidth="6" fill="none" strokeDasharray="12 12" />
                  <path d="M400,900 Q900,700 1500,400 T2400,800" stroke="#0284C7" strokeWidth="5" fill="none" strokeDasharray="8 8" opacity="0.8" />
                  <path d="M100,1200 L2000,1200" stroke="#94A3B8" strokeWidth="4" strokeDasharray="6 6" />

                  {/* Pivôs Centrais de Irrigação (Círculos Verdes Claros Agrícolas) */}
                  <g opacity="0.60">
                    {/* Pivô 01 */}
                    <circle cx="38%" cy="32%" r="180" fill="#DCFCE7" stroke="#10B981" strokeWidth="3" />
                    <text x="38%" y="32%" fill="#047857" fontSize="16" fontWeight="bold" textAnchor="middle">PIVÔ 01</text>

                    {/* Pivô 02 */}
                    <circle cx="55%" cy="24%" r="150" fill="#D1FAE5" stroke="#059669" strokeWidth="3" />
                    <text x="55%" y="24%" fill="#047857" fontSize="16" fontWeight="bold" textAnchor="middle">PIVÔ 02</text>

                    {/* Pivô 03 */}
                    <circle cx="48%" cy="18%" r="120" fill="#ECFDF5" stroke="#10B981" strokeWidth="2" />

                    {/* Pivô 04 */}
                    <circle cx="42%" cy="58%" r="200" fill="#DCFCE7" stroke="#059669" strokeWidth="4" />
                    <text x="42%" y="58%" fill="#047857" fontSize="18" fontWeight="bold" textAnchor="middle">PIVÔ 04 (SEMENTE)</text>

                    {/* Pivô 06 */}
                    <circle cx="30%" cy="44%" r="160" fill="#E0F2FE" stroke="#0284C7" strokeWidth="3" />

                    {/* Pivô 08 */}
                    <circle cx="78%" cy="48%" r="220" fill="#FEF3C7" stroke="#D97706" strokeWidth="4" />
                    <text x="78%" y="48%" fill="#B45309" fontSize="18" fontWeight="bold" textAnchor="middle">PIVÔ 08 (ALGODÃO)</text>
                  </g>

                  {/* Sede Central & Armazéns */}
                  <rect x="35%" y="30%" width="70" height="45" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2" rx="8" className="shadow-md" />
                  <text x="35%" y="28%" fill="#0284C7" fontSize="12" fontWeight="bold">SEDE CENTRAL</text>

                  <rect x="70%" y="33%" width="90" height="55" fill="#FFFFFF" stroke="#D97706" strokeWidth="2" rx="8" className="shadow-md" />
                  <text x="70%" y="31%" fill="#D97706" fontSize="12" fontWeight="bold">ARMAZÉM & SILOS</text>
                </svg>
              </div>
            )}

            {mapaTipo === 'topografico' && (
              <div className="absolute inset-0 bg-[#F1F5F9] opacity-90">
                <svg width="100%" height="100%" className="opacity-40">
                  <path d="M0,100 Q400,300 800,100 T1600,400" stroke="#94A3B8" strokeWidth="2" fill="none" />
                  <path d="M0,300 Q600,500 1200,200 T2000,600" stroke="#94A3B8" strokeWidth="2" fill="none" />
                  <path d="M0,600 Q500,800 1000,500 T1800,900" stroke="#94A3B8" strokeWidth="2" fill="none" />
                </svg>
              </div>
            )}

            {mapaTipo === 'vetorial' && (
              <div className="absolute inset-0 bg-[#E2E8F0]"></div>
            )}
          </div>

          {/* ROTA ANIMADA DO VEÍCULO SELECIONADO */}
          {selectedVeiculo && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              <line 
                x1="35%" 
                y1="30%" 
                x2={`${selectedVeiculo.coords.x}%`} 
                y2={`${selectedVeiculo.coords.y}%`} 
                stroke="#059669" 
                strokeWidth="4" 
                strokeDasharray="8 8" 
                className="animate-pulse"
              />
            </svg>
          )}

          {/* PINS CLAROS DOS VEÍCULOS NO MAPA */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            {veiculosFiltrados.map((v) => {
              const isSelected = selectedVeiculo?.id === v.id;
              
              let pinBg = 'bg-white border-emerald-600 text-emerald-700 shadow-lg';
              
              if (v.status === 'parado') {
                pinBg = 'bg-white border-amber-500 text-amber-700 shadow-lg';
              } else if (v.status === 'alerta') {
                pinBg = 'bg-white border-rose-600 text-rose-700 shadow-lg';
              }

              return (
                <div
                  key={v.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectVeiculo(v);
                  }}
                  className={`absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 group ${
                    isSelected ? 'z-40 scale-125' : 'z-30 hover:scale-110'
                  }`}
                  style={{ top: `${v.coords.y}%`, left: `${v.coords.x}%` }}
                >
                  {/* Pulso de Sinal Vivo */}
                  <div className={`absolute inset-0 rounded-full animate-ping opacity-40 ${v.status === 'alerta' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>

                  {/* Marcador Principal Pin (Visual Claro) */}
                  <div className={`relative w-11 h-11 rounded-2xl flex items-center justify-center border-2 shadow-xl transition-all ${pinBg} ${
                    isSelected ? 'ring-8 ring-emerald-500/20 border-emerald-600 bg-emerald-50' : 'hover:border-emerald-600'
                  }`}>
                    {getTipoIcon(v.tipo)}
                    
                    {/* Badge de Alerta ou Velocidade */}
                    <span className="absolute -top-2 -right-2 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-white shadow-md">
                      {v.velocidade}km/h
                    </span>
                  </div>

                  {/* Tooltip de Hover Rápido */}
                  <div className="absolute top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xl whitespace-nowrap border border-slate-700 pointer-events-none z-50">
                    <p className="font-mono text-emerald-400">{v.placa}</p>
                    <p className="text-slate-300 text-[10px]">{v.veiculo}</p>
                  </div>

                  {/* CARD DE DETALHES POPUP CLARO DO VEÍCULO SELECIONADO */}
                  {isSelected && (
                    <div className="no-drag absolute top-16 left-1/2 -translate-x-1/2 w-80 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200 p-5 text-left z-50 animate-fade-in-up text-slate-800">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{v.numeroOS}</span>
                          <h4 className="text-sm font-black text-slate-900 mt-1 leading-tight">{v.veiculo}</h4>
                        </div>
                        <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">{v.placa}</span>
                      </div>

                      <div className="space-y-2.5 text-xs text-slate-700">
                        <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="text-slate-500 flex items-center"><User size={13} className="mr-1.5 text-slate-400" /> Motorista:</span>
                          <span className="font-bold text-slate-900">{v.motorista}</span>
                        </div>

                        <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="text-slate-500 flex items-center"><Navigation size={13} className="mr-1.5 text-emerald-600" /> Rota:</span>
                          <span className="font-bold text-slate-800">{v.origem} &rarr; {v.destino}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div className="bg-slate-50 p-2 rounded-xl flex items-center justify-between border border-slate-200">
                            <span className="text-slate-500 flex items-center text-[11px]"><Gauge size={13} className="mr-1 text-blue-600" /> Vel:</span>
                            <span className="font-mono font-bold text-slate-900 text-xs">{v.velocidade} km/h</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-xl flex items-center justify-between border border-slate-200">
                            <span className="text-slate-500 flex items-center text-[11px]"><Fuel size={13} className="mr-1 text-amber-600" /> Tanque:</span>
                            <span className="font-mono font-bold text-slate-900 text-xs">{v.combustivel}%</span>
                          </div>
                        </div>

                        {/* Barra de Progresso do Percurso */}
                        <div className="pt-2">
                          <div className="flex justify-between text-[11px] font-bold mb-1">
                            <span className="text-slate-500">Progresso do Percurso</span>
                            <span className="text-emerald-700 font-mono">{v.progresso}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-500" style={{ width: `${v.progresso}%` }}></div>
                          </div>
                        </div>

                        {/* Status de Alerta */}
                        {v.mensagemAlerta && (
                          <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-[11px] flex items-start space-x-2">
                            <AlertTriangle size={14} className="shrink-0 mt-0.5 text-rose-600" />
                            <span>{v.mensagemAlerta}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* PAINEL CLARO FLUTUANTE DE CONTROLES DO MAPA (SUPERIOR ESQUERDO) */}
      <div className="absolute top-6 left-6 z-30 flex flex-col space-y-3 pointer-events-auto">
        <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-slate-200/80 flex items-center space-x-2">
          
          {/* Botões de Zoom */}
          <button 
            onClick={handleZoomIn}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors" 
            title="Aumentar Zoom (+)"
          >
            <Plus size={18} />
          </button>
          
          <button 
            onClick={handleZoomOut}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors" 
            title="Diminuir Zoom (-)"
          >
            <Minus size={18} />
          </button>

          <button 
            onClick={handleResetMap}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors" 
            title="Resetar Posição e Zoom"
          >
            <RotateCcw size={18} />
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1"></div>

          {/* Indicador de Zoom */}
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200">
            {Math.round(zoom * 100)}%
          </span>

          <div className="h-6 w-px bg-slate-200 mx-1"></div>

          {/* Seletor de Tipo de Mapa */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button 
              onClick={() => setMapaTipo('satelite')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${mapaTipo === 'satelite' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Satélite Agro
            </button>
            <button 
              onClick={() => setMapaTipo('topografico')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${mapaTipo === 'topografico' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Topográfico
            </button>
          </div>
        </div>

        {/* Indicador de Status Geral Claro */}
        <div className="flex items-center px-4 py-2 bg-white/90 backdrop-blur-md text-emerald-700 rounded-xl font-bold text-xs border border-slate-200/80 shadow-lg w-fit">
          <Navigation2 size={14} className="mr-2 animate-pulse text-emerald-600" /> 
          Telemetria Fazenda Progresso (12 Veículos Conectados)
        </div>
      </div>

      {/* PAINEL LATERAL DIREITO CLARO (FROTA EM TRÂNSITO) */}
      <div className="absolute right-6 top-6 bottom-6 w-96 bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col z-30 overflow-hidden pointer-events-auto">
        
        {/* Cabeçalho do Painel Lateral */}
        <div className="p-5 border-b border-slate-100 bg-white/80">
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

          {/* Lista de Veículos Cadastrados */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
              Veículos Conectados ({veiculosFiltrados.length})
            </h4>

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
  );
};
