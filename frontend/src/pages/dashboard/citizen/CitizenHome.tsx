import { useNavigate } from 'react-router-dom';
import { AlertTriangle, MapPin, History, Bell, ArrowRight, ShieldCheck, Zap, Phone, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';

const EMERGENCY_TIPS = [
  { icon: '🔥', title: 'Fire Emergency', tip: 'Stay low, cover mouth, alert others and evacuate immediately. Call 101.' },
  { icon: '🚑', title: 'Medical Emergency', tip: 'Keep the person calm, do not move if injured. Call 108 for ambulance.' },
  { icon: '🌊', title: 'Flood Warning', tip: 'Move to higher ground immediately. Avoid walking in moving water.' },
  { icon: '⚡', title: 'Power Hazard', tip: 'Stay away from downed lines. Call the utility company and use dry rubber.' },
];

const CitizenHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [incRes, notifRes] = await Promise.all([
          api.get('/incidents/user'),
          api.get('/notifications'),
        ]);
        setIncidents(incRes.data);
        setUnread(notifRes.data.filter((n: any) => !n.isRead).length);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const activeIncidents = incidents.filter(i => i.status !== 'Resolved');
  const latestIncident = incidents[0];

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16">
      {/* Greeting */}
      <header>
        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-400">
          Hello, {user?.name?.split(' ')[0] || 'Citizen'} 👋
        </h1>
        <p className="text-gray-400 mt-1 text-base">Stay safe. Your emergency command centre is ready.</p>
      </header>

      {/* Live status bar */}
      {!loading && (
        <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border text-sm font-bold ${
          activeIncidents.length > 0
            ? 'bg-orange-500/10 border-orange-500/30 text-orange-300'
            : 'bg-green-500/10 border-green-500/30 text-green-300'
        }`}>
          <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${activeIncidents.length > 0 ? 'bg-orange-400' : 'bg-green-400'}`} />
          {activeIncidents.length > 0
            ? `${activeIncidents.length} active incident${activeIncidents.length > 1 ? 's' : ''} in progress — responders notified`
            : 'All your reports are resolved — You are safe'}
          {unread > 0 && (
            <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-[10px] font-black rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]">
              {unread} new alert{unread > 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* SOS + Quick actions grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Big SOS Button */}
        <div className="lg:col-span-1 flex justify-center items-center relative">
          <div className="absolute w-56 h-56 bg-red-600/10 rounded-full blur-[70px] pointer-events-none animate-pulse" />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => navigate('/dashboard/report')}
            className="relative w-52 h-52 bg-gradient-to-br from-red-600 via-rose-500 to-orange-600 rounded-full flex flex-col items-center justify-center text-white shadow-[0_0_50px_rgba(239,68,68,0.45)] border-4 border-white/20 hover:border-white/40 transition-all cursor-pointer"
          >
            <div className="absolute inset-0 rounded-full border-4 border-red-500/25 animate-ping [animation-duration:1.5s]" />
            <div className="absolute inset-2 rounded-full border border-orange-400/30 animate-ping [animation-duration:2.5s]" />
            <AlertTriangle size={52} className="mb-1 text-white drop-shadow-lg" />
            <span className="text-4xl font-black tracking-wider">SOS</span>
            <span className="text-[10px] uppercase tracking-widest mt-1.5 font-black text-red-100/80">Tap to Report</span>
          </motion.button>
        </div>

        {/* Quick action tiles */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {[
            {
              icon: <MapPin size={24} className="text-cyan-400" />,
              label: 'Live Map',
              desc: 'See all active incidents near you',
              path: '/dashboard/map',
              color: 'border-cyan-500/20 hover:border-cyan-500/40',
              glow: 'from-cyan-600 to-blue-600',
            },
            {
              icon: <History size={24} className="text-indigo-400" />,
              label: 'My Reports',
              desc: `${incidents.length} total report${incidents.length !== 1 ? 's' : ''} filed`,
              path: '/dashboard/history',
              color: 'border-indigo-500/20 hover:border-indigo-500/40',
              glow: 'from-indigo-600 to-purple-600',
            },
            {
              icon: <Bell size={24} className="text-yellow-400" />,
              label: 'Notifications',
              desc: unread > 0 ? `${unread} unread message${unread > 1 ? 's' : ''}` : 'No new alerts',
              path: '/dashboard/notifications',
              color: 'border-yellow-500/20 hover:border-yellow-500/40',
              glow: 'from-yellow-600 to-orange-600',
            },
            {
              icon: <ShieldCheck size={24} className="text-green-400" />,
              label: 'Safety Profile',
              desc: 'Update contact & visibility info',
              path: '/dashboard/profile',
              color: 'border-green-500/20 hover:border-green-500/40',
              glow: 'from-green-600 to-emerald-600',
            },
          ].map(action => (
            <motion.button
              key={action.label}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(action.path)}
              className={`glass-card p-5 rounded-2xl border ${action.color} text-left flex flex-col gap-3 group transition-all shadow-lg`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${action.glow} flex items-center justify-center shadow-md`}>
                {action.icon}
              </div>
              <div>
                <p className="text-white font-extrabold text-base">{action.label}</p>
                <p className="text-gray-500 text-xs font-semibold mt-0.5">{action.desc}</p>
              </div>
              <ArrowRight size={14} className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all mt-auto" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Latest incident status */}
      {latestIncident && (
        <div className="glass-card p-6 rounded-3xl border border-white/5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Zap size={18} className="text-yellow-400" /> Latest Incident Status
            </h2>
            <button
              onClick={() => navigate('/dashboard/history')}
              className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-950/40 rounded-2xl border border-white/5">
            <div className="flex-1">
              <p className="text-white font-extrabold capitalize text-xl">{latestIncident.type?.replace(/_/g, ' ')}</p>
              <p className="text-gray-400 text-sm font-medium mt-1 line-clamp-2">{latestIncident.description}</p>
              {latestIncident.aiAnalysis?.summary && (
                <p className="text-blue-300/70 text-xs font-semibold italic mt-2">🤖 {latestIncident.aiAnalysis.summary}</p>
              )}
              <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-2 font-semibold">
                <Clock size={11} /> {new Date(latestIncident.createdAt).toLocaleString()}
              </div>
            </div>
            <span className={`px-4 py-2 rounded-xl text-sm font-black border shrink-0 ${
              latestIncident.status === 'Resolved' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
              latestIncident.status === 'Dispatched' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
              latestIncident.status === 'InProgress' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' :
              'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
            }`}>
              {latestIncident.status}
            </span>
          </div>
        </div>
      )}

      {/* Emergency tips */}
      <div>
        <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
          <Phone size={18} className="text-red-400" /> Emergency Safety Tips
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EMERGENCY_TIPS.map(tip => (
            <div key={tip.title} className="glass-card p-5 rounded-2xl border border-white/5 flex items-start gap-4 hover:border-white/10 transition-all">
              <span className="text-3xl">{tip.icon}</span>
              <div>
                <p className="text-white font-bold text-sm">{tip.title}</p>
                <p className="text-gray-400 text-xs font-medium mt-1 leading-relaxed">{tip.tip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CitizenHome;
