import { useAuth } from '../../context/AuthContext';
import CitizenHome from './citizen/CitizenHome';
import ResponderDashboard from './responder/ResponderDashboard';
import GovernmentDashboard from './government/GovernmentDashboard';
import AdminDashboard from './admin/AdminDashboard';
import { useEffect, useState } from 'react';

const ROLE_CONFIG: Record<string, { label: string; emoji: string; gradient: string; glow: string }> = {
  admin: { label: 'System Administrator', emoji: '🛡️', gradient: 'from-purple-600 to-indigo-500', glow: 'rgba(139,92,246,0.4)' },
  government: { label: 'Government Officer', emoji: '🏛️', gradient: 'from-emerald-600 to-teal-500', glow: 'rgba(16,185,129,0.4)' },
  government_officer: { label: 'Government Officer', emoji: '🏛️', gradient: 'from-emerald-600 to-teal-500', glow: 'rgba(16,185,129,0.4)' },
  police: { label: 'Police Responder', emoji: '👮', gradient: 'from-blue-600 to-sky-500', glow: 'rgba(59,130,246,0.4)' },
  fire: { label: 'Fire Fighter', emoji: '🚒', gradient: 'from-red-600 to-orange-500', glow: 'rgba(239,68,68,0.4)' },
  ambulance: { label: 'Paramedic', emoji: '🚑', gradient: 'from-pink-600 to-rose-500', glow: 'rgba(236,72,153,0.4)' },
  citizen: { label: 'Citizen', emoji: '🏙️', gradient: 'from-cyan-600 to-blue-500', glow: 'rgba(6,182,212,0.4)' },
};

const SplashScreen = ({ role, name, onDismiss }: { role: string; name: string; onDismiss: () => void }) => {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG['citizen'];
  return (
    <div 
      onClick={onDismiss}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 gap-6 cursor-pointer"
    >
      <div
        className="text-7xl animate-bounce"
        style={{ filter: `drop-shadow(0 0 24px ${config.glow})` }}
      >
        {config.emoji}
      </div>
      <div className="text-center">
        <h1 className={`text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${config.gradient}`}>
          Welcome back, {name.split(' ')[0]}!
        </h1>
        <p className="text-gray-400 mt-2 text-lg font-semibold">{config.label} · AI Emergency Response System</p>
        <p className="text-xs text-gray-500 mt-3 font-semibold">Click anywhere to skip</p>
      </div>
      <div className="w-48 h-1 rounded-full bg-white/5 overflow-hidden mt-2">
        <div className={`h-full rounded-full bg-gradient-to-r ${config.gradient}`}
          style={{ animation: 'slideIn 0.7s ease-out forwards' }} />
      </div>
      <style>{`@keyframes slideIn { from { width:0%; } to { width:100%; } }`}</style>
    </div>
  );
};

const IndexDashboard = () => {
  const { user } = useAuth();
  const [showSplash, setShowSplash] = useState(false);

  const role = user?.role?.toLowerCase() || 'citizen';

  useEffect(() => {
    const key = `splash_shown_${user?._id}`;
    if (!sessionStorage.getItem(key)) {
      setShowSplash(true);
      sessionStorage.setItem(key, '1');
      const t = setTimeout(() => setShowSplash(false), 700);
      return () => clearTimeout(t);
    }
  }, [user?._id]);

  if (showSplash && user?.name) {
    return <SplashScreen role={role} name={user.name} onDismiss={() => setShowSplash(false)} />;
  }

  if (role === 'admin') return <AdminDashboard />;
  if (role === 'government' || role === 'government_officer') return <GovernmentDashboard />;
  if (role === 'police' || role === 'fire' || role === 'ambulance') return <ResponderDashboard />;
  return <CitizenHome />;
};

export default IndexDashboard;
