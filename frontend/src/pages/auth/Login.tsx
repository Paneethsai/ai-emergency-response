import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, LogIn, ShieldAlert, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
  const { login, devLogin } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [devRole, setDevRole] = useState('Citizen');

  const isFirebaseMocked = import.meta.env.VITE_FIREBASE_API_KEY?.includes('dummy');

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const idToken = await userCredential.user.getIdToken();
      await login(idToken);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.message?.includes('api-key-not-valid') || err.message?.includes('invalid-api-key') || err.message === 'Network Error') {
        setError('Demo Mode: Live Firebase backend is not configured. Please choose a role below and click "Launch Developer Bypass" to log in.');
      } else {
        setError(err.message || 'Failed to login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const userCredential = await signInWithPopup(auth, googleProvider);
      const idToken = await userCredential.user.getIdToken();
      await login(idToken, undefined, userCredential.user.displayName || undefined);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.message?.includes('api-key-not-valid') || err.message?.includes('invalid-api-key') || err.message === 'Network Error') {
        setError('Demo Mode: Live Firebase backend is not configured. Please choose a role below and click "Launch Developer Bypass" to log in.');
      } else {
        setError(err.message || 'Google login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await devLogin(devRole);
      navigate('/dashboard');
    } catch (err: any) {
      console.warn('Dev login API call threw error, activating instant client session fallback:', err);
      setError(null);
      const targetRole = devRole || 'Citizen';
      const mockUser = {
        _id: `dev-id-${targetRole.toLowerCase()}`,
        name: `Dev ${targetRole.replace('_', ' ')}`,
        email: `dev@${targetRole.toLowerCase()}.com`,
        role: targetRole,
        phone: '555-0199',
        token: `mock-dev-jwt-token-${targetRole.toLowerCase()}`
      };
      localStorage.setItem('user', JSON.stringify(mockUser));
      window.location.href = '/dashboard';
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060814] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Visual background ambient glow circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-md w-full glass-card rounded-3xl overflow-hidden p-8 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.4)] mb-4">
            <ShieldAlert size={36} className="text-white" />
          </div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-400">
            Welcome Back
          </h2>
          <p className="text-gray-400 text-sm mt-1">AI-Powered Emergency Response Platform</p>
        </div>

        {isFirebaseMocked && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black uppercase tracking-wider">Demo / Test Environment</p>
              <p className="text-xs text-amber-300/90 mt-1 font-medium leading-relaxed">
                Firebase is configured with dummy API keys. Standard login will not connect. Please select a role and use **Developer Bypass Mode** below.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/40 rounded-xl flex items-center gap-3 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Email Address</label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              placeholder="you@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-400 font-medium">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Password</label>
            <input
              {...register('password')}
              type="password"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-xs text-red-400 font-medium">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={20} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="px-4 text-xs uppercase tracking-wider text-gray-500 font-bold">or continue with</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="mt-6 w-full py-3 px-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-3 disabled:opacity-70 hover:-translate-y-0.5"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          <span>Google Accounts</span>
        </button>

        {/* Dynamic Developer Bypass UI */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Cpu size={14} className="text-green-500 animate-pulse" />
              Developer Bypass Role
            </label>
            <select
              value={devRole}
              onChange={(e) => setDevRole(e.target.value)}
              className="w-full px-4 py-2.5 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 font-semibold focus:outline-none focus:ring-1 focus:ring-green-500/50"
            >
              <option value="Citizen" className="bg-slate-900 text-white">Citizen</option>
              <option value="Police" className="bg-slate-900 text-white">Police Responder</option>
              <option value="Fire" className="bg-slate-900 text-white">Fire Responder</option>
              <option value="Ambulance" className="bg-slate-900 text-white">Ambulance Responder</option>
              <option value="Government_Officer" className="bg-slate-900 text-white">Government Officer</option>
              <option value="Admin" className="bg-slate-900 text-white">System Administrator</option>
            </select>
          </div>

          <button
            onClick={handleDevLogin}
            disabled={loading}
            type="button"
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
          >
            <span>Launch Developer Bypass</span>
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-semibold underline decoration-dotted">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
