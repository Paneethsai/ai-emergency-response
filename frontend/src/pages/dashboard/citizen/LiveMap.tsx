import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { MapPin, Filter, RefreshCw, Layers } from 'lucide-react';

// Fix default leaflet icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Color map for incident types
const TYPE_COLORS: Record<string, string> = {
  fire: '#ef4444',
  medical: '#ec4899',
  accident: '#f97316',
  crime: '#8b5cf6',
  flood: '#3b82f6',
  earthquake: '#a16207',
  gas_leak: '#eab308',
  missing_person: '#06b6d4',
  natural_disaster: '#22c55e',
  other: '#94a3b8',
};

const getTypeColor = (type: string) => TYPE_COLORS[type?.toLowerCase()] || TYPE_COLORS['other'];

const createColoredIcon = (color: string, isUser = false) =>
  L.divIcon({
    className: '',
    html: isUser
      ? `<div style="width:16px;height:16px;background:${color};border-radius:50%;border:3px solid white;box-shadow:0 0 14px ${color}88;animation:pulse 1.5s infinite;"></div>`
      : `<div style="width:14px;height:14px;background:${color};border-radius:50%;border:2px solid white;box-shadow:0 0 10px ${color}88;"></div>`,
    iconSize: isUser ? [16, 16] : [14, 14],
    iconAnchor: isUser ? [8, 8] : [7, 7],
  });

// Component to fly map to location
const FlyTo = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => { map.flyTo(center, 13, { duration: 1.2 }); }, [center, map]);
  return null;
};

const INCIDENT_TYPES = ['All', 'fire', 'medical', 'accident', 'crime', 'flood', 'gas_leak', 'missing_person', 'natural_disaster', 'other'];
const STATUS_OPTIONS = ['All', 'Pending', 'Dispatched', 'InProgress', 'Resolved'];

const LiveMap = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = user?.role?.toLowerCase() === 'citizen' ? '/incidents/user' : '/incidents';
      const response = await api.get(endpoint);
      setIncidents(response.data);
      setLastRefresh(new Date());
    } catch (error) {
      console.warn('Backend API unreachable, populating demo map pins:', error);
      setIncidents([
        {
          _id: 'inc-101',
          type: 'fire',
          description: 'Commercial building structure fire on 3rd floor.',
          status: 'Pending',
          location: { coordinates: [-74.0060, 40.7128] },
          createdAt: new Date().toISOString(),
          aiAnalysis: { severity: 'Critical' },
          reporterId: { name: 'John Doe', email: 'john@example.com' }
        },
        {
          _id: 'inc-102',
          type: 'medical',
          description: 'Multi-vehicle collision on highway.',
          status: 'Dispatched',
          location: { coordinates: [-73.9851, 40.7589] },
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          aiAnalysis: { severity: 'High' },
          reporterId: { name: 'Sarah Connor', email: 'sarah@example.com' }
        },
        {
          _id: 'inc-103',
          type: 'crime',
          description: 'Attempted burglary near residential compound.',
          status: 'Resolved',
          location: { coordinates: [-73.9712, 40.7831] },
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          aiAnalysis: { severity: 'Medium' },
          reporterId: { name: 'Alex Mercer', email: 'alex@example.com' }
        }
      ]);
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    fetchIncidents();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.warn('Could not get user location', err)
      );
    }
    // Auto-refresh every 15 seconds
    const interval = setInterval(fetchIncidents, 15000);
    return () => clearInterval(interval);
  }, [fetchIncidents]);

  const filtered = incidents.filter(inc => {
    const matchType = typeFilter === 'All' || inc.type?.toLowerCase() === typeFilter;
    const matchStatus = statusFilter === 'All' || inc.status === statusFilter;
    return matchType && matchStatus;
  });

  const defaultCenter: [number, number] = [40.7128, -74.0060];
  const center: [number, number] = userLocation ||
    (incidents.length > 0 && incidents[0].location?.coordinates
      ? [incidents[0].location.coordinates[1], incidents[0].location.coordinates[0]]
      : defaultCenter);

  const countByStatus = (s: string) => incidents.filter(i => i.status === s).length;

  return (
    <div className="space-y-4 pb-16">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.35)]">
            <MapPin size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-400">
              Live Incident Map
            </h1>
            <p className="text-gray-500 text-xs font-semibold">
              {filtered.length} incident{filtered.length !== 1 ? 's' : ''} visible · refreshed {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 border transition-all ${showFilters ? 'bg-blue-500/15 border-blue-500/30 text-blue-400' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
          >
            <Filter size={14} /> Filters
          </button>
          <button
            onClick={fetchIncidents}
            className="px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 border bg-white/5 border-white/10 text-gray-400 hover:text-white transition-all"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </header>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: incidents.length, color: 'border-blue-500/20 text-blue-400' },
          { label: 'Pending', value: countByStatus('Pending'), color: 'border-yellow-500/20 text-yellow-400' },
          { label: 'In Progress', value: countByStatus('InProgress') + countByStatus('Dispatched'), color: 'border-orange-500/20 text-orange-400' },
          { label: 'Resolved', value: countByStatus('Resolved'), color: 'border-green-500/20 text-green-400' },
        ].map(s => (
          <div key={s.label} className={`glass-card p-4 rounded-2xl border ${s.color} flex items-center justify-between`}>
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wide">{s.label}</span>
            <span className={`text-2xl font-black ${s.color.split(' ')[1]}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-wrap gap-4 items-center">
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Incident Type</p>
            <div className="flex flex-wrap gap-2">
              {INCIDENT_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  style={typeFilter === t && t !== 'All' ? { borderColor: getTypeColor(t), color: getTypeColor(t), background: getTypeColor(t) + '22' } : {}}
                  className={`px-3 py-1 rounded-full text-xs font-black border transition-all capitalize ${
                    typeFilter === t ? (t === 'All' ? 'bg-white/10 border-white/20 text-white' : 'border-current') : 'border-white/5 text-gray-500 hover:text-white hover:border-white/20'
                  }`}
                >
                  {t.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Status</p>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 rounded-full text-xs font-black border transition-all ${
                    statusFilter === s ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-gray-500 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]" style={{ height: '62vh' }}>
        {loading && (
          <div className="absolute inset-0 z-[9999] bg-slate-950/80 flex items-center justify-center gap-3 rounded-3xl">
            <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            <span className="text-white font-bold text-sm">Loading live data...</span>
          </div>
        )}

        {/* Legend overlay */}
        <div className="absolute top-4 right-4 z-[1000] glass-card p-3 rounded-2xl border border-white/10 space-y-1.5 max-h-60 overflow-y-auto">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><Layers size={10} /> Legend</p>
          {Object.entries(TYPE_COLORS).slice(0, 8).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}88` }} />
              <span className="text-[10px] text-gray-400 font-bold capitalize">{type.replace('_', ' ')}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 border-t border-white/5 pt-1.5 mt-1.5">
            <div className="w-3 h-3 rounded-full shrink-0 bg-blue-400" style={{ boxShadow: '0 0 8px #60a5fa' }} />
            <span className="text-[10px] text-blue-400 font-bold">Your Location</span>
          </div>
        </div>

        <MapContainer
          center={center}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {userLocation && <FlyTo center={userLocation} />}

          {userLocation && (
            <Marker position={userLocation} icon={createColoredIcon('#60a5fa', true)}>
              <Popup>
                <div className="p-1 min-w-[120px]">
                  <p className="font-bold text-blue-600">📍 Your Location</p>
                </div>
              </Popup>
            </Marker>
          )}

          {filtered.map((incident) => {
            if (!incident.location?.coordinates) return null;
            const color = getTypeColor(incident.type);
            return (
              <Marker
                key={incident._id}
                position={[incident.location.coordinates[1], incident.location.coordinates[0]]}
                icon={createColoredIcon(color)}
              >
                <Popup>
                  <div className="p-2 min-w-[200px] space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                      <h3 className="font-black text-gray-800 text-sm capitalize">{incident.type.replace(/_/g, ' ')}</h3>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{incident.description}</p>
                    {incident.aiAnalysis?.severity && (
                      <p className="text-xs font-bold text-gray-500">Severity: <span style={{ color }}>{incident.aiAnalysis.severity}</span></p>
                    )}
                    {incident.reporterId && (
                      <div className="text-xs text-gray-500 border-t pt-1.5">
                        <p className="font-bold text-gray-700">{incident.reporterId.name}</p>
                        <p>{incident.reporterId.email}</p>
                      </div>
                    )}
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-white text-[10px] font-black ${
                      incident.status === 'Resolved' ? 'bg-green-500' :
                      incident.status === 'Dispatched' ? 'bg-blue-500' :
                      incident.status === 'InProgress' ? 'bg-indigo-500' : 'bg-yellow-500'
                    }`}>
                      {incident.status}
                    </span>
                    <p className="text-[10px] text-gray-400 block">{new Date(incident.createdAt).toLocaleString()}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default LiveMap;
