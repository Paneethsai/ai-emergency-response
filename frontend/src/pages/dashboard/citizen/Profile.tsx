import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { User, Mail, Phone, Shield, Save, CheckCircle } from 'lucide-react';
import api from '../../../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put('/users/profile', { phone });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save profile', err);
    } finally {
      setSaving(false);
    }
  };

  const roleColor = () => {
    const r = user?.role?.toLowerCase();
    if (r === 'admin') return 'from-purple-600 to-indigo-500';
    if (r === 'police' || r === 'fire' || r === 'ambulance') return 'from-red-600 to-orange-500';
    if (r === 'government' || r === 'government_officer') return 'from-emerald-600 to-teal-500';
    return 'from-blue-600 to-cyan-500';
  };

  return (
    <div className="max-w-2xl mx-auto pb-16 space-y-8">
      <header>
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-400">
          Profile Settings
        </h1>
        <p className="text-gray-400 mt-1 text-sm">Manage your personal details and contact information.</p>
      </header>

      {/* Avatar card */}
      <div className="glass-card rounded-3xl border border-white/5 p-8 shadow-2xl">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/5">
          <div className={`w-24 h-24 bg-gradient-to-tr ${roleColor()} rounded-2xl flex items-center justify-center text-4xl font-black text-white uppercase shadow-[0_0_30px_rgba(0,0,0,0.4)]`}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">{user?.name || 'User'}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Shield size={14} className="text-gray-400" />
              <span className={`text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r ${roleColor()}`}>
                {user?.role?.replace('_', ' ')} Account
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Email - read only */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-3.5 text-gray-500" />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-white/5 rounded-xl text-gray-400 cursor-not-allowed text-sm font-medium"
              />
            </div>
            <p className="text-[10px] text-gray-600 mt-1 font-semibold uppercase tracking-wider">Email is managed via your authentication provider.</p>
          </div>

          {/* Role - read only */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">System Role</label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-3.5 text-gray-500" />
              <input
                type="text"
                disabled
                value={user?.role?.replace('_', ' ') || ''}
                className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-white/5 rounded-xl text-gray-400 cursor-not-allowed text-sm font-semibold capitalize"
              />
            </div>
          </div>

          {/* Phone - editable */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Phone Number</label>
            <div className="relative">
              <Phone size={16} className="absolute left-4 top-3.5 text-gray-500" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all text-sm font-medium"
              />
            </div>
            <p className="text-[10px] text-gray-600 mt-1 font-semibold uppercase tracking-wider">Used for emergency contact verification by responders.</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className={`w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 text-sm transition-all hover:-translate-y-0.5 ${
              saved
                ? 'bg-gradient-to-r from-green-600 to-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                : 'bg-gradient-to-r from-blue-600 to-indigo-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]'
            } disabled:opacity-50`}
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : saved ? (
              <><CheckCircle size={18} /> Profile Saved!</>
            ) : (
              <><Save size={18} /> Save Changes</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
