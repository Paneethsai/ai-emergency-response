import { useEffect, useState } from 'react';
import { ShieldCheck, Users, Search, RefreshCw, Smartphone, Key, CircleDot } from 'lucide-react';
import api from '../../../services/api';

interface UserDetail {
  _id: string;
  firebaseUid: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  status: string;
  createdAt: string;
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/users');
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch registered users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = users;
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      result = result.filter(u => 
        u.name.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q)
      );
    }
    if (roleFilter !== 'All') {
      result = result.filter(u => u.role.toLowerCase() === roleFilter.toLowerCase());
    }
    setFilteredUsers(result);
  }, [search, roleFilter, users]);

  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role.toLowerCase() === 'admin').length;
  const citizenCount = users.filter(u => u.role.toLowerCase() === 'citizen').length;
  const responderCount = users.filter(u => ['police', 'fire', 'ambulance', 'hospital'].includes(u.role.toLowerCase())).length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header section */}
      <header className="flex justify-between items-center bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 p-6 rounded-2xl glow-purple relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.4)]">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">System Admin Console</h1>
            <p className="text-purple-300 text-sm mt-1">Manage global users, credentials, and responder access roles.</p>
          </div>
        </div>
        <button 
          onClick={fetchUsers} 
          disabled={loading}
          className="p-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl transition-all disabled:opacity-50"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      {/* Stats section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Accounts', value: totalUsers, icon: <Users className="text-blue-400" />, glowClass: 'border-blue-500/20 bg-blue-500/5 text-blue-400' },
          { label: 'System Admins', value: adminCount, icon: <Key className="text-purple-400" />, glowClass: 'border-purple-500/20 bg-purple-500/5 text-purple-400' },
          { label: 'Registered Citizens', value: citizenCount, icon: <Smartphone className="text-green-400" />, glowClass: 'border-green-500/20 bg-green-500/5 text-green-400' },
          { label: 'Emergency Responders', value: responderCount, icon: <ShieldCheck className="text-orange-400" />, glowClass: 'border-orange-500/20 bg-orange-500/5 text-orange-400' },
        ].map(stat => (
          <div key={stat.label} className={`glass-card p-6 rounded-2xl flex items-center justify-between border ${stat.glowClass} hover-lift shadow-[0_4px_25px_rgba(0,0,0,0.2)]`}>
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-white">{stat.value}</h3>
            </div>
            <div className="p-3.5 bg-slate-950/40 rounded-xl">{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* Filter and Table Card */}
      <div className="glass-card rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center bg-white/2">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-3.5 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all text-sm font-medium"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-xs text-gray-400 font-bold uppercase shrink-0">Filter Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full md:w-48 px-4 py-2.5 bg-slate-900/60 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500/50 transition-all text-sm font-semibold"
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Citizen">Citizen</option>
              <option value="Police">Police</option>
              <option value="Fire">Fire</option>
              <option value="Ambulance">Ambulance</option>
              <option value="Hospital">Hospital</option>
              <option value="Government_Officer">Government Officer</option>
            </select>
          </div>
        </div>

        {error ? (
          <div className="p-12 text-center text-red-400 font-semibold">{error}</div>
        ) : loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4 text-gray-400">
            <RefreshCw className="animate-spin text-purple-500" size={36} />
            <p className="font-semibold text-sm">Querying system accounts...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-20 text-center text-gray-500 font-semibold">No registered users matched the query.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-950/40 text-gray-400 border-b border-white/5 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">User Name</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">Phone Number</th>
                  <th className="py-4 px-6">System Role</th>
                  <th className="py-4 px-6">Activity Status</th>
                  <th className="py-4 px-6">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-white/2 transition-colors">
                    <td className="py-4 px-6 font-bold text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xs font-extrabold text-white uppercase shadow-sm">
                        {user.name.charAt(0)}
                      </div>
                      {user.name}
                    </td>
                    <td className="py-4 px-6 text-gray-300 font-medium">{user.email}</td>
                    <td className="py-4 px-6 text-gray-400 font-semibold">{user.phone || '—'}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black border tracking-wide inline-flex items-center gap-1.5 ${
                        user.role.toLowerCase() === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                        user.role.toLowerCase() === 'citizen' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                        user.role.toLowerCase() === 'government_officer' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                        'bg-orange-500/10 text-orange-400 border-orange-500/30'
                      }`}>
                        <CircleDot size={8} className="animate-pulse" />
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-bold text-xs uppercase ${
                        user.status === 'Active' ? 'text-green-500' :
                        user.status === 'Busy' ? 'text-amber-500' : 'text-gray-500'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500 font-semibold">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
