import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, AlertTriangle, CheckCircle, Clock, Search, ShieldAlert, CircleDot } from 'lucide-react';
import api from '../../../services/api';

const GovernmentDashboard = () => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [logSearch, setLogSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const [incRes, statRes] = await Promise.all([
          api.get('/incidents'),
          api.get('/incidents/analytics')
        ]);
        setIncidents(incRes.data);
        setAnalytics(statRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchIncidents();
  }, []);

  const total = incidents.length;
  const pending = incidents.filter(i => i.status === 'Pending').length;
  const resolved = incidents.filter(i => i.status === 'Resolved').length;

  const severityData = [
    { name: 'Critical', value: incidents.filter(i => i.aiAnalysis?.severity === 'Critical').length },
    { name: 'High', value: incidents.filter(i => i.aiAnalysis?.severity === 'High').length },
    { name: 'Medium', value: incidents.filter(i => i.aiAnalysis?.severity === 'Medium').length },
    { name: 'Low', value: incidents.filter(i => i.aiAnalysis?.severity === 'Low').length },
  ];
  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch = inc.description.toLowerCase().includes(logSearch.toLowerCase()) ||
      inc.address?.toLowerCase().includes(logSearch.toLowerCase()) ||
      inc.type.toLowerCase().includes(logSearch.toLowerCase()) ||
      inc.reporterId?.name?.toLowerCase().includes(logSearch.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || inc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      <header className="mb-4">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-400">
          City Overview & Incident Analytics
        </h1>
        <p className="text-gray-400 mt-2 text-base">Global dispatch analytics, responder efficiency metrics, and severity breakdown.</p>
      </header>
      
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Incidents', value: total, icon: <Activity size={24} className="text-blue-400" />, glowClass: 'border-blue-500/20 bg-blue-500/5 glow-blue text-blue-400' },
          { label: 'Pending Response', value: pending, icon: <AlertTriangle size={24} className="text-red-400" />, glowClass: 'border-red-500/20 bg-red-500/5 glow-red text-red-400' },
          { label: 'Avg Response Time', value: '14m', icon: <Clock size={24} className="text-yellow-400" />, glowClass: 'border-yellow-500/20 bg-yellow-500/5 glow-yellow text-yellow-400' },
          { label: 'Resolved Cases', value: resolved, icon: <CheckCircle size={24} className="text-green-400" />, glowClass: 'border-green-500/20 bg-green-500/5 glow-green text-green-400' },
        ].map(stat => (
          <div key={stat.label} className={`glass-card p-6 rounded-2xl flex items-center justify-between border ${stat.glowClass} hover-lift shadow-[0_4px_25px_rgba(0,0,0,0.2)]`}>
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-white">
                {stat.value}
              </h3>
            </div>
            <div className="p-3.5 bg-slate-950/40 rounded-xl shadow-inner">{stat.icon}</div>
          </div>
        ))}
      </div>

      <div className="glass-card p-6 rounded-3xl border border-white/5 shadow-2xl">
        <h3 className="text-xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Incidents Breakdown</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} fontWeight="bold" />
              <YAxis stroke="#9ca3af" allowDecimals={false} fontSize={12} fontWeight="bold" />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
              <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                {analytics.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6 rounded-3xl border border-white/5 hover-lift shadow-2xl">
          <h3 className="text-xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">Incidents by Severity</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={severityData} innerRadius={65} outerRadius={95} paddingAngle={4} dataKey="value">
                  {severityData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/5 hover-lift shadow-2xl">
          <h3 className="text-xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Recent Activity Log</h3>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {incidents.slice(0, 10).map((inc) => (
              <div key={inc._id} className="p-4 bg-slate-950/40 rounded-2xl border border-white/5 flex justify-between items-center hover:bg-slate-900/60 transition-colors">
                <div>
                  <p className="font-bold text-white text-base">{inc.type.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-500 mt-1 font-semibold">{new Date(inc.createdAt).toLocaleString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider ${
                  inc.status === 'Resolved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {inc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Dispatch Log Table */}
      <div className="glass-card rounded-3xl border border-white/5 shadow-2xl overflow-hidden mt-8">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center bg-white/2">
          <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400 flex items-center gap-2">
            <ShieldAlert size={20} className="text-rose-500" />
            Detailed Dispatch Log
          </h3>
          
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto items-center">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3.5 top-3 text-gray-500" size={16} />
              <input
                type="text"
                placeholder="Search description or reporter..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-white/10 rounded-xl text-white outline-none focus:border-rose-500/50 transition-all text-xs font-semibold"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-36 px-3 py-2 bg-slate-900/60 border border-white/10 rounded-xl text-white outline-none focus:border-rose-500/50 transition-all text-xs font-semibold"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredIncidents.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-semibold">No incidents match the search criteria.</div>
          ) : (
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-950/40 text-gray-400 border-b border-white/5 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Incident Type</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6">Severity</th>
                  <th className="py-4 px-6">Reporter Citizen</th>
                  <th className="py-4 px-6">Response Status</th>
                  <th className="py-4 px-6">Date Reported</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredIncidents.map((inc) => (
                  <tr key={inc._id} className="hover:bg-white/2 transition-colors">
                    <td className="py-4 px-6 font-bold text-white uppercase tracking-wider">{inc.type.replace('_', ' ')}</td>
                    <td className="py-4 px-6 text-gray-300 font-medium max-w-xs truncate">{inc.description}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded-full font-black ${
                        inc.aiAnalysis?.severity === 'Critical' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                        inc.aiAnalysis?.severity === 'High' ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30' :
                        'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                      }`}>
                        {inc.aiAnalysis?.severity || 'Medium'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-300">
                      {inc.reporterId ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-white">{inc.reporterId.name}</span>
                          <span className="text-[10px] text-gray-500">{inc.reporterId.email}</span>
                          {inc.reporterId.phone && <span className="text-[10px] text-gray-500">{inc.reporterId.phone}</span>}
                        </div>
                      ) : (
                        <span className="text-gray-500 font-semibold">Anonymous</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded-full font-black tracking-wide inline-flex items-center gap-1.5 ${
                        inc.status === 'Resolved' ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
                        inc.status === 'Dispatched' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                        'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        <CircleDot size={6} className="animate-pulse" />
                        {inc.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500 font-semibold">
                      {new Date(inc.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default GovernmentDashboard;
