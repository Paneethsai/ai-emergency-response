import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const CitizenHome = () => {
  const navigate = useNavigate();

  const handleSOS = () => {
    navigate('/dashboard/report');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="mb-4">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-400">
          Emergency Command Center
        </h1>
        <p className="text-gray-400 mt-2 text-base">Request immediate dispatch response or log an incident with AI priority analysis.</p>
      </header>

      {/* Main SOS Button */}
      <div className="flex justify-center items-center py-8 relative">
        {/* Glow ambient background aura */}
        <div className="absolute w-72 h-72 bg-red-600/10 rounded-full blur-[80px] pointer-events-none animate-pulse" />
        
        <motion.button
          whileHover={{ scale: 1.06, rotate: 1 }}
          whileTap={{ scale: 0.94 }}
          onClick={handleSOS}
          className="relative group w-64 h-64 bg-gradient-to-br from-red-600 via-rose-500 to-orange-600 rounded-full flex flex-col items-center justify-center text-white shadow-[0_0_50px_rgba(239,68,68,0.5)] border-4 border-white/20 hover:border-white/40 transition-all cursor-pointer"
        >
          {/* Multiple pulsating circles */}
          <div className="absolute inset-0 rounded-full border-4 border-red-500/25 animate-ping [animation-duration:1.5s]" />
          <div className="absolute inset-2 rounded-full border border-orange-400/35 animate-ping [animation-duration:2.5s]" />
          
          <AlertTriangle size={68} className="mb-2 text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)] group-hover:scale-110 transition-transform duration-300" />
          <span className="text-5xl font-black tracking-wider drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)]">SOS</span>
          <span className="text-xs uppercase tracking-widest mt-2 font-black text-red-100/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">Tap for Emergency</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-6 rounded-3xl border border-white/5 hover-lift shadow-2xl">
          <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Live GPS Coverage</h3>
          <div className="h-48 bg-slate-950/60 rounded-2xl flex flex-col items-center justify-center border border-white/5 p-4 text-center">
            <p className="text-gray-400 text-sm font-semibold">Map coordinates successfully synchronized.</p>
            <p className="text-xs text-gray-500 mt-1.5">View and monitor responder units on the sidebar map view.</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/5 hover-lift shadow-2xl">
          <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Active Responses</h3>
          <div className="h-48 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl flex items-center justify-center mb-4 text-green-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <span className="text-2xl font-bold">✓</span>
            </div>
            <p className="text-gray-200 font-bold">Secure Connection Established</p>
            <p className="text-gray-500 text-xs mt-1">No active reports under review. You are safe.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenHome;
