import { useEffect, useState } from 'react';
import { ShieldAlert, MapPin, Clock, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

// Fix default leaflet marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map panning helper component
const ChangeMapView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
};

const ResponderDashboard = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

  // AI protocol states
  const [protocols, setProtocols] = useState<{ [key: string]: string[] }>({});
  const [loadingProtocolId, setLoadingProtocolId] = useState<string | null>(null);
  const [expandedProtocolId, setExpandedProtocolId] = useState<string | null>(null);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await api.get('/incidents');
        setIncidents(response.data);
        
        // Find first incident with valid location to center map
        const validLoc = response.data.find((inc: any) => inc.location?.coordinates);
        if (validLoc) {
          setMapCenter([validLoc.location.coordinates[1], validLoc.location.coordinates[0]]);
        }
      } catch (err) {
        console.warn('Backend API unreachable, populating demo dispatch items:', err);
        const mockList = [
          {
            _id: 'inc-101',
            type: 'Fire_Emergency',
            description: 'Commercial building structure fire on 3rd floor. Heavy smoke visible.',
            status: 'Pending',
            address: '452 Downtown Plaza, Sector 4',
            location: { coordinates: [-74.0060, 40.7128] },
            createdAt: new Date().toISOString(),
            aiAnalysis: { severity: 'Critical', summary: 'High risk structure fire with potential trapped personnel.' },
            reporterId: { name: 'John Doe', email: 'john@example.com', phone: '+1 555-0144' }
          },
          {
            _id: 'inc-102',
            type: 'Medical_Emergency',
            description: 'Multi-vehicle collision on highway. Trauma team required.',
            status: 'Dispatched',
            address: 'Grand Trunk Highway, Exit 12',
            location: { coordinates: [-73.9851, 40.7589] },
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            aiAnalysis: { severity: 'High', summary: 'Severe vehicle collision with casualty risk.' },
            reporterId: { name: 'Sarah Connor', email: 'sarah@example.com', phone: '+1 555-0188' }
          },
          {
            _id: 'inc-103',
            type: 'Crime_Report',
            description: 'Attempted burglary reported near residential compound perimeter.',
            status: 'Pending',
            address: '88 Oakridge Drive',
            location: { coordinates: [-73.9712, 40.7831] },
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            aiAnalysis: { severity: 'Medium', summary: 'Active perimeter breach reported by security officer.' },
            reporterId: { name: 'Alex Mercer', email: 'alex@example.com', phone: '+1 555-0199' }
          }
        ];
        setIncidents(mockList);
        setMapCenter([40.7128, -74.0060]);
      }
    };
    fetchIncidents();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      await api.put(`/incidents/${id}/status`, { status: newStatus });
      setIncidents(incidents.map(inc => inc._id === id ? { ...inc, status: newStatus } : inc));
    } catch (error) {
      console.error('Failed to update status', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleProtocol = async (id: string) => {
    if (expandedProtocolId === id) {
      setExpandedProtocolId(null);
      return;
    }
    setExpandedProtocolId(id);
    if (!protocols[id]) {
      try {
        setLoadingProtocolId(id);
        const res = await api.get(`/incidents/${id}/protocol`);
        setProtocols(prev => ({ ...prev, [id]: res.data.protocol }));
      } catch (err) {
        console.error('Failed to get protocol', err);
        // Fallback guidelines
        setProtocols(prev => ({
          ...prev,
          [id]: [
            'Establish incident command post and assess hazards.',
            'Coordinate safety gear check and deploy to the hot zone.',
            'Secure scene boundaries and evacuate immediate vicinity.',
            'Perform primary rescue and medical triage as needed.'
          ]
        }));
      } finally {
        setLoadingProtocolId(null);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      <header className="mb-4">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-400">
          {user?.role?.replace('_', ' ')} Dispatch Hub
        </h1>
        <p className="text-gray-400 mt-2 text-base">Real-time emergency tracking, incident maps, and responder task assignment.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Leaflet Map */}
        <div className="lg:col-span-7 h-[72vh] glass-card rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative z-0">
          {mapCenter ? (
            <MapContainer 
              center={mapCenter} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ChangeMapView center={mapCenter} />
              {incidents.map((incident) => {
                if (!incident.location?.coordinates) return null;
                const lat = incident.location.coordinates[1];
                const lng = incident.location.coordinates[0];
                return (
                  <Marker 
                    key={incident._id} 
                    position={[lat, lng]}
                  >
                    <Popup>
                      <div className="p-1 min-w-[150px]">
                        <h3 className="font-bold text-gray-800 text-sm">{incident.type.replace('_', ' ')}</h3>
                        <p className="text-xs text-gray-600 my-1 line-clamp-2">{incident.description}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full text-white font-bold inline-block ${
                          incident.status === 'Pending' ? 'bg-yellow-500' :
                          incident.status === 'Dispatched' ? 'bg-blue-500' : 'bg-green-500'
                        }`}>
                          {incident.status}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 font-semibold bg-slate-950/40">
              No active incident locations to map.
            </div>
          )}
        </div>

        {/* Right Column: Dispatch list */}
        <div className="lg:col-span-5 space-y-6 max-h-[72vh] overflow-y-auto pr-2 custom-scrollbar">
          {incidents.map((incident) => (
            <div 
              key={incident._id} 
              onClick={() => {
                if (incident.location?.coordinates) {
                  setMapCenter([incident.location.coordinates[1], incident.location.coordinates[0]]);
                }
              }}
              className="glass-card rounded-2xl p-6 flex flex-col hover-lift relative overflow-hidden border border-white/5 cursor-pointer hover:border-blue-500/30 transition-all shadow-lg"
            >
              {incident.status === 'Resolved' && <div className="absolute inset-0 bg-green-500/5 backdrop-blur-sm z-0 pointer-events-none" />}
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  incident.aiAnalysis?.severity === 'Critical' ? 'bg-red-500/20 text-red-500 border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.15)]' :
                  incident.aiAnalysis?.severity === 'High' ? 'bg-orange-500/20 text-orange-500 border border-orange-500/40' :
                  'bg-yellow-500/20 text-yellow-500 border border-yellow-500/40'
                }`}>
                  {incident.aiAnalysis?.severity || 'Unknown'} Severity
                </span>
                <span className={`text-xs font-bold ${
                  incident.status === 'Pending' ? 'text-yellow-500' :
                  incident.status === 'Dispatched' ? 'text-blue-500' : 'text-green-500'
                }`}>
                  {incident.status}
                </span>
              </div>
              
              <h3 className="text-2xl font-extrabold mb-2 relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">{incident.type.replace('_', ' ')}</h3>
              <p className="text-gray-300 text-sm mb-4 line-clamp-3 relative z-10">{incident.description}</p>
              
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-2 relative z-10">
                <MapPin size={14} className="text-red-400" />
                <span className="truncate">{incident.address || `Lat: ${incident.location.coordinates[1].toFixed(4)}, Lng: ${incident.location.coordinates[0].toFixed(4)}`}</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-4 relative z-10">
                <Clock size={14} />
                <span>{new Date(incident.createdAt).toLocaleString()}</span>
              </div>

              {/* Reporter details section */}
              {incident.reporterId && (
                <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 mb-4 relative z-10 text-xs">
                  <p className="text-gray-400 font-bold uppercase tracking-wider mb-1.5 text-[10px]">Citizen Reporter Details</p>
                  <div className="flex flex-col gap-1 text-gray-300">
                    <p className="font-bold"><span className="text-gray-500">Name:</span> {incident.reporterId.name || 'Anonymous'}</p>
                    <p className="font-semibold"><span className="text-gray-500">Email:</span> {incident.reporterId.email || '—'}</p>
                    <p className="font-semibold"><span className="text-gray-500">Phone:</span> {incident.reporterId.phone || '—'}</p>
                  </div>
                </div>
              )}

              {/* AI response protocol trigger */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Avoid triggering map re-centering again
                  toggleProtocol(incident._id);
                }}
                className="mb-4 py-2.5 px-3 bg-purple-600/10 hover:bg-purple-600/20 text-purple-300 border border-purple-500/20 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all relative z-10"
              >
                <Sparkles size={14} className="text-purple-400" />
                <span>{expandedProtocolId === incident._id ? 'Hide AI Guidelines' : 'Generate AI Action Protocol'}</span>
              </button>

              {expandedProtocolId === incident._id && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="mb-4 bg-purple-950/20 border border-purple-500/25 p-4 rounded-xl relative z-10 text-xs shadow-inner"
                >
                  <p className="text-purple-400 font-black uppercase tracking-wider mb-2 text-[10px] flex items-center gap-1.5">
                    <Sparkles size={12} className="animate-pulse" /> AI Response Guidelines
                  </p>
                  {loadingProtocolId === incident._id ? (
                    <div className="flex items-center gap-2 text-gray-500 font-semibold py-2">
                      <RefreshCw className="animate-spin text-purple-500" size={14} />
                      <span>Generating emergency steps...</span>
                    </div>
                  ) : protocols[incident._id] ? (
                    <ul className="space-y-2 list-decimal pl-4 text-gray-300 font-semibold leading-relaxed">
                      {protocols[incident._id].map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-red-400 font-semibold">Failed to fetch guidelines.</p>
                  )}
                </div>
              )}
              
              <div className="mt-auto relative z-10">
                {incident.status === 'Pending' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(incident._id, 'Dispatched');
                    }}
                    disabled={updatingId === incident._id}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.35)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 font-bold disabled:opacity-50 text-sm"
                  >
                    {updatingId === incident._id ? 'Updating...' : 'Dispatch Unit'} <ArrowRight size={16} />
                  </button>
                )}
                {incident.status === 'Dispatched' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(incident._id, 'Resolved');
                    }}
                    disabled={updatingId === incident._id}
                    className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.35)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 font-bold disabled:opacity-50 text-sm"
                  >
                    {updatingId === incident._id ? 'Resolving...' : 'Resolve Incident'}
                  </button>
                )}
              </div>
            </div>
          ))}
          {incidents.length === 0 && (
            <div className="text-center py-20 text-gray-500 glass-card rounded-2xl border border-white/5">
              <ShieldAlert size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-semibold text-sm">No active incidents assigned to your unit.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResponderDashboard;
