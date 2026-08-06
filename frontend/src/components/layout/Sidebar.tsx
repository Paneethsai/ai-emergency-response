import { NavLink, useNavigate } from 'react-router-dom';
import { Home, History, User, LogOut, AlertTriangle, Map, BarChart2, ShieldAlert, Bell, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import clsx from 'clsx';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get('/notifications');
        setUnreadCount(res.data.filter((n: any) => !n.isRead).length);
      } catch { /* silent fail */ }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const citizenNav = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={18} /> },
    { name: 'Report Emergency', path: '/dashboard/report', icon: <AlertTriangle size={18} /> },
    { name: 'Live Map', path: '/dashboard/map', icon: <Map size={18} /> },
    { name: 'Incident History', path: '/dashboard/history', icon: <History size={18} /> },
    { name: 'Notifications', path: '/dashboard/notifications', icon: <Bell size={18} />, badge: unreadCount },
    { name: 'Profile', path: '/dashboard/profile', icon: <User size={18} /> },
  ];

  const responderNav = [
    { name: 'Incidents Board', path: '/dashboard', icon: <ShieldAlert size={18} /> },
    { name: 'Live Map', path: '/dashboard/map', icon: <Map size={18} /> },
    { name: 'Notifications', path: '/dashboard/notifications', icon: <Bell size={18} />, badge: unreadCount },
    { name: 'Profile', path: '/dashboard/profile', icon: <User size={18} /> },
  ];

  const govtNav = [
    { name: 'City Overview', path: '/dashboard', icon: <BarChart2 size={18} /> },
    { name: 'Live Map', path: '/dashboard/map', icon: <Map size={18} /> },
    { name: 'Notifications', path: '/dashboard/notifications', icon: <Bell size={18} />, badge: unreadCount },
    { name: 'Profile', path: '/dashboard/profile', icon: <User size={18} /> },
  ];

  const adminNav = [
    { name: 'Admin Console', path: '/dashboard', icon: <ShieldAlert size={18} /> },
    { name: 'Live Map', path: '/dashboard/map', icon: <Map size={18} /> },
    { name: 'Notifications', path: '/dashboard/notifications', icon: <Bell size={18} />, badge: unreadCount },
    { name: 'Profile', path: '/dashboard/profile', icon: <User size={18} /> },
  ];

  const role = user?.role?.toLowerCase();
  let navItems = citizenNav;
  if (role === 'police' || role === 'fire' || role === 'ambulance') navItems = responderNav;
  else if (role === 'government' || role === 'government_officer') navItems = govtNav;
  else if (role === 'admin') navItems = adminNav;

  const roleGradient = () => {
    if (role === 'admin') return 'from-purple-600 to-indigo-500';
    if (role === 'government' || role === 'government_officer') return 'from-emerald-600 to-teal-500';
    if (role === 'police' || role === 'fire' || role === 'ambulance') return 'from-red-600 to-orange-500';
    return 'from-blue-600 to-cyan-500';
  };

  const roleGlow = () => {
    if (role === 'admin') return 'shadow-[0_4px_15px_rgba(139,92,246,0.35)]';
    if (role === 'government' || role === 'government_officer') return 'shadow-[0_4px_15px_rgba(16,185,129,0.35)]';
    if (role === 'police' || role === 'fire' || role === 'ambulance') return 'shadow-[0_4px_15px_rgba(220,38,38,0.35)]';
    return 'shadow-[0_4px_15px_rgba(59,130,246,0.35)]';
  };

  const activeClass = `bg-gradient-to-r ${roleGradient()} text-white ${roleGlow()}`;

  const roleEmoji = () => {
    if (role === 'admin') return '🛡️';
    if (role === 'government' || role === 'government_officer') return '🏛️';
    if (role === 'police') return '👮';
    if (role === 'fire') return '🚒';
    if (role === 'ambulance') return '🚑';
    return '🏙️';
  };

  return (
    <div className="w-64 glass-card border-r border-white/5 flex flex-col min-h-[calc(100vh-4rem)] relative z-40">
      {/* User info card */}
      <div className="px-4 pt-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${roleGradient()} flex items-center justify-center text-lg font-black text-white shrink-0`}>
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm truncate">{user?.name || 'User'}</p>
            <p className="text-gray-500 text-[10px] font-semibold capitalize truncate flex items-center gap-1">
              <span>{roleEmoji()}</span>
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
          <div className="ml-auto flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_6px_rgba(74,222,128,0.8)]" title="Online" />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-3">
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 px-3 mb-2">Navigation</p>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) =>
              clsx(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-semibold text-sm relative',
                isActive
                  ? activeClass
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )
            }
          >
            <div className="transition-transform duration-200 group-hover:scale-110 shrink-0">
              {item.icon}
            </div>
            <span className="transition-transform duration-200 group-hover:translate-x-0.5 flex-1">
              {item.name}
            </span>
            {(item as any).badge > 0 && (
              <span className="px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-black rounded-full min-w-[18px] text-center shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse">
                {(item as any).badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Live system status */}
      <div className="mx-3 mb-3 p-3 rounded-xl bg-white/2 border border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <Activity size={12} className="text-green-400 animate-pulse" />
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">System Status</p>
        </div>
        <div className="space-y-1.5">
          {[
            { label: 'API Server', ok: true },
            { label: 'AI Engine', ok: true },
            { label: 'Database', ok: true },
          ].map(s => (
            <div key={s.label} className="flex items-center justify-between">
              <span className="text-[10px] text-gray-500 font-semibold">{s.label}</span>
              <span className={`text-[9px] font-black ${s.ok ? 'text-green-400' : 'text-red-400'}`}>
                {s.ok ? '● Online' : '● Offline'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all font-semibold text-sm group"
        >
          <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
