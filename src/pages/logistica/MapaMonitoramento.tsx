import { useEffect, useState, useCallback } from 'react';
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
  Navigation2,
  Search,
  AlertCircle,
  Gauge,
  User,
  Layers,
  Map as MapIcon,
  WifiOff,
  RefreshCw,
  BatteryFull,
  Droplets,
  Thermometer,
  Fuel,
  Clock,
  Tag
} from 'lucide-react';

const GOOGLE_MAPS_API_KEY = 'AIzaSyAeQIKfNplzSj3wnUdIVBSnhzDb0OuFPwM';
// Sem VITE_API_URL, usa caminho relativo (mesma origem) — funciona tanto no Vercel
// (api/frota/*.ts como serverless functions) quanto local via `vercel dev`.
const API_URL = import.meta.env.VITE_API_URL ?? '';
const POLL_INTERVAL_MS = 15000;

// Centro aproximado da Fazenda Progresso em Mucugê / Chapada Diamantina - BA
const FAZENDA_CENTER = { lat: -13.0047, lng: -41.3708 };

// vw_UltimaPosicao (SELECT * FROM vw_UltimaPosicao ORDER BY 2, como o cliente indicou), enriquecida
// com o tipo do equipamento (Equipamentos/TiposEquipamento) e a leitura mais recente de sensores
// e de operação (LeiturasSensor/LeiturasOperacao) — ver api/frota/posicoes.ts
interface PosicaoEquipamento {
  EquipamentoId: number;
  CodigoEquipamento: string;
  Nome: string;
  GrupoFrente: string | null;
  Fazenda: string | null;
  Latitude: number | null;
  Longitude: number | null;
  VelocidadeKmh: number | null;
  DirecaoGraus: number | null;
  Estado: string | null;
  OperacaoDescricao: string | null;
  Operador: string | null;
  CodigoTalhao: string | null;
  DataHoraOperacao: string | null;
  ColetadoEm: string | null;
  MinutosSemComunicacao: number | null;
  TipoEquipamento: string | null;
  // Última leitura de LeiturasSensor
  PorcentagemCargaBateria: number | null;
  TensaoBateria: number | null;
  TemperaturaBateria: number | null;
  UmidadeSolo: number | null;
  UmidadeSolo2: number | null;
  UmidadeSolo3: number | null;
  TemperaturaAmbiente: number | null;
  EnergiaGeradaDia: number | null;
  EnergiaConsumidaDia: number | null;
  SensorColetadoEmUtc: string | null;
  // Última leitura de LeiturasOperacao
  ConsumoMedioLitros: number | null;
  VelocidadeMediaOperacao: number | null;
  RpmMedio: number | null;
  TempoMotorLigadoSegundos: number | null;
  TempoMotorOciosoSegundos: number | null;
  AreaOperacional: number | null;
  OperacaoColetadoEmUtc: string | null;
  // A API usa p.* — a view do cliente pode trazer outras colunas além das listadas acima
  [campo: string]: unknown;
}

const formatNumero = (valor: number | null, casas = 1) => (valor === null || valor === undefined ? '—' : valor.toFixed(casas));

const mediaUmidadeSolo = (p: PosicaoEquipamento) => {
  const valores = [p.UmidadeSolo, p.UmidadeSolo2, p.UmidadeSolo3].filter((v): v is number => v !== null && v !== undefined);
  if (valores.length === 0) return null;
  return valores.reduce((soma, v) => soma + v, 0) / valores.length;
};

const formatHoras = (segundos: number | null) => {
  if (segundos === null || segundos === undefined) return '—';
  return `${(segundos / 3600).toFixed(1)}h`;
};

// % do tempo com motor ligado que o equipamento passou parado (ocioso)
const percentualTempoParado = (p: PosicaoEquipamento) => {
  const ocioso = p.TempoMotorOciosoSegundos;
  const ligado = p.TempoMotorLigadoSegundos;
  if (ocioso === null || ocioso === undefined || !ligado) return null;
  return (ocioso / ligado) * 100;
};

// Nomes de campo do banco (ex: "PorcentagemCargaBateria") viram rótulo legível ("Porcentagem Carga Bateria")
const formatRotuloCampo = (chave: string) => chave.replace(/([a-z0-9])([A-Z])/g, '$1 $2');

const formatValorCampo = (valor: unknown): string => {
  if (valor === null || valor === undefined || valor === '') return '—';
  if (typeof valor === 'boolean') return valor ? 'Sim' : 'Não';
  if (typeof valor === 'number') return Number.isInteger(valor) ? String(valor) : valor.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
  if (typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(valor)) {
    const data = new Date(valor);
    return Number.isNaN(data.getTime()) ? valor : data.toLocaleString('pt-BR');
  }
  return String(valor);
};

type StatusComunicacao = 'online' | 'atencao' | 'offline' | 'sem_dados';

const getStatusComunicacao = (minutos: number | null): StatusComunicacao => {
  if (minutos === null || minutos === undefined) return 'sem_dados';
  if (minutos <= 5) return 'online';
  if (minutos <= 30) return 'atencao';
  return 'offline';
};

const formatDataHora = (iso: string | null) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('pt-BR');
  } catch {
    return iso;
  }
};

// Componente para controlar a câmera do Google Maps suavemente ao focar num equipamento
const MapController = ({ targetPosition }: { targetPosition: { lat: number; lng: number } | null }) => {
  const map = useMap();

  if (map && targetPosition) {
    map.panTo(targetPosition);
  }

  return null;
};

export const MapaMonitoramento = () => {
  const [posicoes, setPosicoes] = useState<PosicaoEquipamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null);
  const [selectedEquipamento, setSelectedEquipamento] = useState<PosicaoEquipamento | null>(null);
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<'todos' | StatusComunicacao>('todos');
  const [mapTypeId, setMapTypeId] = useState<'hybrid' | 'roadmap' | 'terrain'>('hybrid');
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);

  const carregarPosicoes = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/frota/posicoes`);
      if (!response.ok) {
        throw new Error(`API respondeu ${response.status}`);
      }
      const data: PosicaoEquipamento[] = await response.json();
      setPosicoes(data);
      setErro(null);
      setUltimaAtualizacao(new Date());
      if (!selectedEquipamento && data.length > 0) {
        setSelectedEquipamento(data[0]);
      }
    } catch (error) {
      console.error('Erro ao buscar vw_UltimaPosicao:', error);
      setErro('Não foi possível conectar ao banco de dados da fazenda (SQL Server). Verifique as variáveis MSSQL_* no Vercel (ou, em desenvolvimento local, rode com `vercel dev`) e confira os logs da function em /api/frota/posicoes.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    carregarPosicoes();
    const interval = setInterval(carregarPosicoes, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [carregarPosicoes]);

  const handleSelectEquipamento = (equipamento: PosicaoEquipamento) => {
    setSelectedEquipamento(equipamento);
    if (equipamento.Latitude !== null && equipamento.Longitude !== null) {
      setMapCenter({ lat: equipamento.Latitude, lng: equipamento.Longitude });
    }
  };

  const posicoesComCoordenadas = posicoes.filter(
    (p) => p.Latitude !== null && p.Longitude !== null
  );

  const posicoesFiltradas = posicoesComCoordenadas.filter((p) => {
    const status = getStatusComunicacao(p.MinutosSemComunicacao);
    const matchesStatus = statusFiltro === 'todos' || status === statusFiltro;

    const termo = busca.toLowerCase();
    const matchesBusca =
      p.Nome.toLowerCase().includes(termo) ||
      p.CodigoEquipamento.toLowerCase().includes(termo) ||
      (p.Operador ?? '').toLowerCase().includes(termo) ||
      (p.GrupoFrente ?? '').toLowerCase().includes(termo);

    return matchesStatus && matchesBusca;
  });

  const pinClasses = (status: StatusComunicacao) => {
    switch (status) {
      case 'online':
        return 'bg-white border-emerald-600 text-emerald-700 shadow-lg';
      case 'atencao':
        return 'bg-white border-amber-500 text-amber-700 shadow-lg';
      case 'offline':
        return 'bg-white border-rose-600 text-rose-700 shadow-lg opacity-80';
      default:
        return 'bg-white border-slate-400 text-slate-600 shadow-lg opacity-60';
    }
  };

  const statusBadge = (status: StatusComunicacao) => {
    switch (status) {
      case 'online':
        return <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold border border-emerald-200 flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span> Online</span>;
      case 'atencao':
        return <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold border border-amber-200 flex items-center"><AlertCircle size={10} className="mr-1" /> Sem sinal recente</span>;
      case 'offline':
        return <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold border border-rose-200 flex items-center"><WifiOff size={10} className="mr-1" /> Offline</span>;
      default:
        return <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold border border-slate-200">Sem dados</span>;
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

            {posicoesFiltradas.map((p) => {
              const status = getStatusComunicacao(p.MinutosSemComunicacao);
              const isSelected = selectedEquipamento?.EquipamentoId === p.EquipamentoId;
              const position = { lat: p.Latitude as number, lng: p.Longitude as number };

              return (
                <AdvancedMarker
                  key={p.EquipamentoId}
                  position={position}
                  onClick={() => handleSelectEquipamento(p)}
                  zIndex={isSelected ? 100 : 10}
                >
                  <div className={`relative cursor-pointer transition-all duration-300 group ${isSelected ? 'scale-125' : 'hover:scale-110'}`}>
                    <div className={`absolute inset-0 rounded-full animate-ping opacity-40 ${status === 'offline' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>

                    <div className={`relative w-11 h-11 rounded-2xl flex items-center justify-center border-2 shadow-xl transition-all ${pinClasses(status)} ${isSelected ? 'ring-8 ring-emerald-500/30 border-emerald-600 bg-emerald-50 scale-110' : 'hover:border-emerald-600'}`}>
                      <Truck size={16} />
                      {p.VelocidadeKmh !== null && (
                        <span className="absolute -top-2 -right-2 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-white shadow-md">
                          {Math.round(p.VelocidadeKmh)}km/h
                        </span>
                      )}
                    </div>

                    <div className="absolute top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xl whitespace-nowrap border border-slate-700 pointer-events-none z-50">
                      <p className="font-mono text-emerald-400">{p.CodigoEquipamento}</p>
                      <p className="text-slate-300 text-[10px]">{p.Nome}</p>
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}

            {selectedEquipamento && selectedEquipamento.Latitude !== null && selectedEquipamento.Longitude !== null && (
              <InfoWindow
                position={{ lat: selectedEquipamento.Latitude, lng: selectedEquipamento.Longitude }}
                onCloseClick={() => setSelectedEquipamento(null)}
                headerContent={
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {selectedEquipamento.CodigoEquipamento}
                    </span>
                  </div>
                }
              >
                <div className="w-72 p-1 text-slate-800 text-xs max-h-96 overflow-y-auto">
                  <h4 className="text-sm font-black text-slate-900 leading-tight">{selectedEquipamento.Nome}</h4>
                  {selectedEquipamento.TipoEquipamento && (
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-2 flex items-center">
                      <Tag size={10} className="mr-1" /> {selectedEquipamento.TipoEquipamento}
                    </p>
                  )}
                  {!selectedEquipamento.TipoEquipamento && <div className="mb-2" />}

                  <div className="space-y-2 text-xs">
                    {selectedEquipamento.Operador && (
                      <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        <span className="text-slate-500 flex items-center"><User size={12} className="mr-1 text-slate-400" /> Operador:</span>
                        <span className="font-bold text-slate-900">{selectedEquipamento.Operador}</span>
                      </div>
                    )}

                    {(selectedEquipamento.OperacaoDescricao || selectedEquipamento.CodigoTalhao) && (
                      <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        <span className="text-slate-500 flex items-center"><MapPin size={12} className="mr-1 text-emerald-600" /> Operação:</span>
                        <span className="font-bold text-slate-800 truncate max-w-[140px]">
                          {selectedEquipamento.OperacaoDescricao ?? '—'}{selectedEquipamento.CodigoTalhao ? ` · Talhão ${selectedEquipamento.CodigoTalhao}` : ''}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <div className="bg-slate-50 p-1.5 rounded-lg flex items-center justify-between border border-slate-200">
                        <span className="text-slate-500 flex items-center text-[10px]"><Gauge size={12} className="mr-1 text-blue-600" /> Vel:</span>
                        <span className="font-mono font-bold text-slate-900 text-xs">{selectedEquipamento.VelocidadeKmh ?? '—'} km/h</span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-lg flex items-center justify-between border border-slate-200">
                        <span className="text-slate-500 flex items-center text-[10px]">Estado:</span>
                        <span className="font-bold text-slate-900 text-xs truncate max-w-[70px]">{selectedEquipamento.Estado ?? '—'}</span>
                      </div>
                    </div>

                    {(selectedEquipamento.PorcentagemCargaBateria !== null || mediaUmidadeSolo(selectedEquipamento) !== null || selectedEquipamento.TemperaturaAmbiente !== null) && (
                      <div className="pt-1 border-t border-slate-100">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Sensores</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {selectedEquipamento.PorcentagemCargaBateria !== null && (
                            <div className="bg-slate-50 p-1.5 rounded-lg flex items-center justify-between border border-slate-200">
                              <span className="text-slate-500 flex items-center text-[10px]"><BatteryFull size={12} className="mr-1 text-emerald-600" /> Bateria:</span>
                              <span className="font-mono font-bold text-slate-900 text-xs">{formatNumero(selectedEquipamento.PorcentagemCargaBateria, 0)}%</span>
                            </div>
                          )}
                          {mediaUmidadeSolo(selectedEquipamento) !== null && (
                            <div className="bg-slate-50 p-1.5 rounded-lg flex items-center justify-between border border-slate-200">
                              <span className="text-slate-500 flex items-center text-[10px]"><Droplets size={12} className="mr-1 text-blue-600" /> Solo:</span>
                              <span className="font-mono font-bold text-slate-900 text-xs">{formatNumero(mediaUmidadeSolo(selectedEquipamento), 0)}%</span>
                            </div>
                          )}
                          {selectedEquipamento.TemperaturaAmbiente !== null && (
                            <div className="bg-slate-50 p-1.5 rounded-lg flex items-center justify-between border border-slate-200">
                              <span className="text-slate-500 flex items-center text-[10px]"><Thermometer size={12} className="mr-1 text-amber-600" /> Temp:</span>
                              <span className="font-mono font-bold text-slate-900 text-xs">{formatNumero(selectedEquipamento.TemperaturaAmbiente, 0)}°C</span>
                            </div>
                          )}
                          {selectedEquipamento.TensaoBateria !== null && (
                            <div className="bg-slate-50 p-1.5 rounded-lg flex items-center justify-between border border-slate-200">
                              <span className="text-slate-500 flex items-center text-[10px]">Tensão:</span>
                              <span className="font-mono font-bold text-slate-900 text-xs">{formatNumero(selectedEquipamento.TensaoBateria, 1)}V</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {(selectedEquipamento.ConsumoMedioLitros !== null || selectedEquipamento.RpmMedio !== null || selectedEquipamento.AreaOperacional !== null || selectedEquipamento.VelocidadeMediaOperacao !== null || selectedEquipamento.TempoMotorOciosoSegundos !== null) && (
                      <div className="pt-1 border-t border-slate-100">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Operação</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {selectedEquipamento.VelocidadeMediaOperacao !== null && (
                            <div className="bg-slate-50 p-1.5 rounded-lg flex items-center justify-between border border-slate-200">
                              <span className="text-slate-500 flex items-center text-[10px]"><Gauge size={12} className="mr-1 text-blue-600" /> Vel. média:</span>
                              <span className="font-mono font-bold text-slate-900 text-xs">{formatNumero(selectedEquipamento.VelocidadeMediaOperacao, 1)} km/h</span>
                            </div>
                          )}
                          {selectedEquipamento.RpmMedio !== null && (
                            <div className="bg-slate-50 p-1.5 rounded-lg flex items-center justify-between border border-slate-200">
                              <span className="text-slate-500 flex items-center text-[10px]">RPM médio:</span>
                              <span className="font-mono font-bold text-slate-900 text-xs">{formatNumero(selectedEquipamento.RpmMedio, 0)}</span>
                            </div>
                          )}
                          {selectedEquipamento.TempoMotorOciosoSegundos !== null && (
                            <div className="bg-slate-50 p-1.5 rounded-lg flex items-center justify-between border border-slate-200">
                              <span className="text-slate-500 flex items-center text-[10px]"><Clock size={12} className="mr-1 text-amber-600" /> Parado:</span>
                              <span className="font-mono font-bold text-slate-900 text-xs">
                                {formatHoras(selectedEquipamento.TempoMotorOciosoSegundos)}
                                {percentualTempoParado(selectedEquipamento) !== null && ` (${formatNumero(percentualTempoParado(selectedEquipamento), 0)}%)`}
                              </span>
                            </div>
                          )}
                          {selectedEquipamento.ConsumoMedioLitros !== null && (
                            <div className="bg-slate-50 p-1.5 rounded-lg flex items-center justify-between border border-slate-200">
                              <span className="text-slate-500 flex items-center text-[10px]"><Fuel size={12} className="mr-1 text-rose-600" /> Combust.:</span>
                              <span className="font-mono font-bold text-slate-900 text-xs">{formatNumero(selectedEquipamento.ConsumoMedioLitros, 1)}L</span>
                            </div>
                          )}
                          {selectedEquipamento.TempoMotorLigadoSegundos !== null && (
                            <div className="bg-slate-50 p-1.5 rounded-lg flex items-center justify-between border border-slate-200">
                              <span className="text-slate-500 flex items-center text-[10px]">Motor ligado:</span>
                              <span className="font-mono font-bold text-slate-900 text-xs">{formatHoras(selectedEquipamento.TempoMotorLigadoSegundos)}</span>
                            </div>
                          )}
                          {selectedEquipamento.AreaOperacional !== null && (
                            <div className="bg-slate-50 p-1.5 rounded-lg flex items-center justify-between border border-slate-200">
                              <span className="text-slate-500 flex items-center text-[10px]">Área:</span>
                              <span className="font-mono font-bold text-slate-900 text-xs">{formatNumero(selectedEquipamento.AreaOperacional, 1)}ha</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="pt-1 flex items-center justify-between">
                      {statusBadge(getStatusComunicacao(selectedEquipamento.MinutosSemComunicacao))}
                      <span className="text-slate-400 text-[10px]">{formatDataHora(selectedEquipamento.DataHoraOperacao)}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Todos os dados do equipamento</p>
                      <div className="space-y-1">
                        {Object.entries(selectedEquipamento).map(([chave, valor]) => (
                          <div key={chave} className="flex justify-between items-start gap-2 text-[10.5px] py-0.5 border-b border-slate-50">
                            <span className="text-slate-400 shrink-0">{formatRotuloCampo(chave)}</span>
                            <span className="font-mono font-medium text-slate-700 text-right break-all">{formatValorCampo(valor)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
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
              <span>Google Maps Ativo</span>
            </div>

            <div className="h-6 w-px bg-slate-200 mx-1"></div>

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

          <div className={`flex items-center px-4 py-2 backdrop-blur-md rounded-xl font-bold text-xs border shadow-lg w-fit ${erro ? 'bg-rose-50/95 text-rose-700 border-rose-200' : 'bg-white/90 text-emerald-700 border-slate-200/80'}`}>
            {erro ? <WifiOff size={14} className="mr-2 text-rose-600" /> : <Navigation2 size={14} className="mr-2 animate-pulse text-emerald-600" />}
            {erro
              ? 'Sem conexão com o banco de dados'
              : `Fazenda Progresso — ${posicoesComCoordenadas.length} equipamento(s) com posição`}
            {ultimaAtualizacao && !erro && (
              <span className="ml-2 text-slate-400 font-medium">
                atualizado {ultimaAtualizacao.toLocaleTimeString('pt-BR')}
              </span>
            )}
            <button onClick={carregarPosicoes} className="ml-2 text-slate-400 hover:text-emerald-600" title="Atualizar agora">
              <RefreshCw size={13} />
            </button>
          </div>

          {erro && (
            <div className="max-w-sm bg-rose-50/95 backdrop-blur-md text-rose-700 rounded-xl border border-rose-200 shadow-lg p-3 text-[11px] leading-relaxed">
              {erro}
            </div>
          )}
        </div>

        {/* PAINEL LATERAL DIREITO (FROTA EM MONITORAMENTO) */}
        <div className="absolute right-6 top-8 bottom-6 w-96 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col z-30 overflow-hidden pointer-events-auto">

          <div className="p-5 pt-6 border-b border-slate-100 bg-white/90">
            <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center">
              <Truck className="mr-2.5 text-emerald-600" size={20} /> Frota em Monitoramento
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">Última posição de cada equipamento (vw_UltimaPosicao)</p>
          </div>

          <div className="p-4 border-b border-slate-100 space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar equipamento, código ou operador..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
              />
            </div>

            <div className="flex overflow-x-auto space-x-1.5 pb-1 scrollbar-none">
              {(['todos', 'online', 'atencao', 'offline'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFiltro(status)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg capitalize whitespace-nowrap transition-colors ${
                    statusFiltro === status
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 bg-slate-100'
                  }`}
                >
                  {status === 'atencao' ? 'sem sinal recente' : status}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading && (
              <p className="text-xs text-slate-400 text-center py-8">Carregando posições...</p>
            )}

            {!loading && posicoesFiltradas.length === 0 && !erro && (
              <p className="text-xs text-slate-400 text-center py-8">Nenhum equipamento encontrado.</p>
            )}

            <div className="space-y-2">
              {posicoesFiltradas.length > 0 && (
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                  Equipamentos ({posicoesFiltradas.length})
                </h4>
              )}

              <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-300">
                {posicoesFiltradas.map((p) => {
                  const status = getStatusComunicacao(p.MinutosSemComunicacao);
                  const isSelected = selectedEquipamento?.EquipamentoId === p.EquipamentoId;

                  return (
                    <div
                      key={p.EquipamentoId}
                      onClick={() => handleSelectEquipamento(p)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/70 shadow-md ring-1 ring-emerald-500/20'
                          : 'border-slate-200/80 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-mono font-bold text-emerald-700 text-xs">{p.CodigoEquipamento}</span>
                        {statusBadge(status)}
                      </div>

                      <p className="text-xs font-bold text-slate-800 truncate">{p.Nome}</p>
                      {p.TipoEquipamento && (
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{p.TipoEquipamento}</p>
                      )}
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                        {p.Operador ?? 'Sem operador'} {p.GrupoFrente ? `• ${p.GrupoFrente}` : ''}
                      </p>
                      {p.PorcentagemCargaBateria !== null && (
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5 flex items-center">
                          <BatteryFull size={11} className="mr-1 text-emerald-600" /> {formatNumero(p.PorcentagemCargaBateria, 0)}% bateria
                        </p>
                      )}

                      <div className="flex justify-between items-center text-[11px] font-medium border-t border-slate-100 pt-2.5 mt-2.5">
                        <span className="text-slate-500 flex items-center">
                          <MapPin size={11} className="mr-1 text-emerald-600" />
                          {p.CodigoTalhao ? `Talhão ${p.CodigoTalhao}` : p.OperacaoDescricao ?? '—'}
                        </span>
                        <span className="font-mono text-emerald-700 font-bold">{p.VelocidadeKmh ?? 0} km/h</span>
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
