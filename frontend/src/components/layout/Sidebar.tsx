import { NavLink, useNavigate } from 'react-router-dom';
import { Home, History, User, LogOut, AlertTriangle, Map, BarChart2, ShieldAlert, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const citizenNav = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} /> },
    { name: 'Report Emergency', path: '/dashboard/report', icon: <AlertTriangle size={20} /> },
    { name: 'Live Map', path: '/dashboard/map', icon: <Map size={20} /> },
    { name: 'Incident History', path: '/dashboard/history', icon: <History size={20} /> },
    { name: 'Notifications', path: '/dashboard/notifications', icon: <Bell size={20} /> },
    { name: 'Profile', path: '/dashboard/profile', icon: <User size={20} /> },
  ];

  const responderNav = [
    { name: 'Incidents Board', path: '/dashboard', icon: <ShieldAlert size={20} /> },
    { name: 'Live Map', path: '/dashboard/map', icon: <Map size={20} /> },
    { name: 'Notifications', path: '/dashboard/notifications', icon: <Bell size={20} /> },
    { name: 'Profile', path: '/dashboard/profile', icon: <User size={20} /> },
  ];

  const govtNav = [
    { name: 'City Overview', path: '/dashboard', icon: <BarChart2 size={20} /> },
    { name: 'Live Map', path: '/dashboard/map', icon: <Map size={20} /> },
    { name: 'Notifications', path: '/dashboard/notifications', icon: <Bell size={20} /> },
    { name: 'Profile', path: '/dashboard/profile', icon: <User size={20} /> },
  ];

  const adminNav = [
    { name: 'Admin Console', path: '/dashboard', icon: <ShieldAlert size={20} /> },
    { name: 'Live Map', path: '/dashboard/map', icon: <Map size={20} /> },
    { name: 'Notifications', path: '/dashboard/notifications', icon: <Bell size={20} /> },
    { name: 'Profile', path: '/dashboard/profile', icon: <User size={20} /> },
  ];

  let navItems = citizenNav;
  const role = user?.role?.toLowerCase();
  if (role === 'police' || role === 'fire' || role === 'ambulance') {
    navItems = responderNav;
  } else if (role === 'government' || role === 'government_officer') {
    navItems = govtNav;
  } else if (role === 'admin') {
    navItems = adminNav;
  }

  const getActiveStyle = () => {
    if (role === 'admin') return 'bg-gradient-to-r from-purple-600 to-indigo-500 text-white shadow-[0_4px_15px_rgba(139,92,246,0.35)]';
    if (role === 'government' || role === 'government_officer') return 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-[0_4px_15px_rgba(16,185,129,0.35)]';
    if (role === 'police' || role === 'fire' || role === 'ambulance') return 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-[0_4px_15px_rgba(220,38,38,0.35)]';
    return 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_4px_15px_rgba(59,130,246,0.35)]';
  };

  return (
    <div className="w-64 glass-card border-r border-gray-800 flex flex-col min-h-[calc(100vh-4rem)] relative z-40">
      <div className="flex-1 py-6 flex flex-col gap-2 px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) =>
              clsx(
                'group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium',
                isActive 
                  ? getActiveStyle()
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )
            }
          >
            <div className="transition-transform duration-300 group-hover:scale-110">
              {item.icon}
            </div>
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              {item.name}
            </span>
          </NavLink>
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-colors font-medium"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
