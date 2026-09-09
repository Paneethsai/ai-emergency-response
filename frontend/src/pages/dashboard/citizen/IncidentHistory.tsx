import { useEffect, useState } from 'react';
import { ClipboardList, Clock, Search, CircleDot } from 'lucide-react';
import api from '../../../services/api';

interface Incident {
  _id: string;
  type: string;
  status: string;
  description: string;
  address?: string;
  aiAnalysis?: { severity: string; summary: string; tags: string[] };
  createdAt: string;
}

const IncidentHistory = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await api.get('/incidents/user');
        setIncidents(response.data);
      } catch (error) {
        console.warn('Backend endpoint unreachable, populating demo history:', error);
        const stored = JSON.parse(localStorage.getItem('user_incidents') || '[]');
        const sampleReports: Incident[] = [
          {
            _id: 'inc-991',
            type: 'Fire_Emergency',
            status: 'Pending',
            description: 'Building smoke reported in residential complex.',
            address: '42 Park Avenue',
            aiAnalysis: { severity: 'Critical', summary: 'Potential structure fire. Dispatched emergency units.', tags: ['fire', 'rescue'] },
            createdAt: new Date().toISOString()
          },
          {
            _id: 'inc-992',
            type: 'Medical_Emergency',
            status: 'Resolved',
            description: 'Heat stroke emergency at public sports ground.',
            address: 'Central Sports Complex',
            aiAnalysis: { severity: 'Medium', summary: 'Medical assistance provided. Patient stabilized.', tags: ['medical', 'ambulance'] },
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ];
        setIncidents([...stored, ...sampleReports]);
      } finally {
        setLoading(false);
      }
    };
    fetchIncidents();
  }, []);

  const filtered = incidents.filter(inc => {
    const matchSearch = inc.type.toLowerCase().includes(search.toLowerCase()) ||
      inc.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || inc.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-8">
      <header>
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.35)]">
            <ClipboardList size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-400">
              Incident History
            </h1>
            <p className="text-gray-400 text-sm">All your submitted emergency reports and their status.</p>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search incidents by type or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500/50 transition-all text-sm font-medium"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-44 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500/50 transition-all text-sm font-semibold"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Dispatched">Dispatched</option>
          <option value="InProgress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm font-semibold">Loading your incident history...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-16 rounded-3xl border border-white/5 text-center">
          <ClipboardList size={48} className="mx-auto mb-4 text-gray-600 opacity-40" />
          <p className="text-gray-400 font-semibold text-lg">
            {incidents.length === 0 ? "You haven't reported any incidents yet." : "No incidents match your search."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((incident) => (
            <div key={incident._id} className="glass-card p-6 rounded-3xl border border-white/5 hover-lift hover:border-blue-500/20 transition-all shadow-lg">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-xl font-extrabold text-white capitalize">{incident.type.replace(/_/g, ' ')}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 ${
                      incident.status === 'Resolved' ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
                      incident.status === 'Dispatched' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                      incident.status === 'InProgress' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30' :
                      'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      <CircleDot size={7} className="animate-pulse" />
                      {incident.status}
                    </span>
                    {incident.aiAnalysis?.severity && (
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black tracking-wide border ${
                        incident.aiAnalysis.severity === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                        incident.aiAnalysis.severity === 'High' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' :
                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                      }`}>
                        {incident.aiAnalysis.severity} Severity
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm line-clamp-2 font-medium mb-2">{incident.description}</p>
                  {incident.aiAnalysis?.summary && (
                    <p className="text-blue-300/70 text-xs font-semibold italic mt-1">🤖 AI: {incident.aiAnalysis.summary}</p>
                  )}
                  {incident.aiAnalysis?.tags && incident.aiAnalysis.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {incident.aiAnalysis.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-white/5 border border-white/10 text-gray-400 text-[10px] font-bold rounded-full uppercase tracking-wide">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-3 font-semibold">
                    <Clock size={12} />
                    <span>{new Date(incident.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IncidentHistory;
