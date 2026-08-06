import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, UserPlus, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const signupSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Citizen', 'Police', 'Ambulance', 'Fire', 'Hospital', 'Government_Officer', 'Admin']),
});

type SignupForm = z.infer<typeof signupSchema>;

const Signup = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isFirebaseMocked = import.meta.env.VITE_FIREBASE_API_KEY?.includes('dummy');

  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: 'Citizen' },
  });

  const onSubmit = async (data: SignupForm) => {
    try {
      setLoading(true);
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const idToken = await userCredential.user.getIdToken();
      await login(idToken, data.role, data.name);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.message?.includes('api-key-not-valid')) {
        setError('Firebase API key is invalid. Please use the developer bypass login on the login screen to sign in.');
      } else {
        setError(err.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      setError(null);
      const userCredential = await signInWithPopup(auth, googleProvider);
      const idToken = await userCredential.user.getIdToken();
      await login(idToken, 'Citizen', userCredential.user.displayName || undefined);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.message?.includes('api-key-not-valid')) {
        setError('Firebase API key is invalid. Please use the developer bypass login on the login screen to sign in.');
      } else {
        setError(err.message || 'Google signup failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060814] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient glow circles */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-md w-full glass-card rounded-3xl overflow-hidden p-8 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative z-10"
      >
        <div className="p-2">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)] mb-4">
              <ShieldAlert size={32} className="text-white" />
            </div>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-400">
              Create Account
            </h2>
            <p className="text-gray-400 text-sm mt-1">Join the AI Emergency Response suite</p>
          </div>

          {isFirebaseMocked && (
            <div className="mb-6 p-4.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black uppercase tracking-wider">Demo / Test Environment</p>
                <p className="text-xs text-amber-300/90 mt-1 font-medium leading-relaxed">
                  Firebase is configured with dummy API keys. Standard signup will not connect. Please sign in via the **Developer Bypass Mode** on the login screen.
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Full Name</label>
              <input
                {...register('name')}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-sm"
                placeholder="John Doe"
              />
              {errors.name && <p className="mt-1 text-xs text-red-400 font-medium">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Email</label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-sm"
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-xs text-red-400 font-medium">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Password</label>
              <input
                {...register('password')}
                type="password"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-sm"
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-xs text-red-400 font-medium">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Security / Platform Role</label>
              <select
                {...register('role')}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold text-sm"
              >
                <option value="Citizen" className="bg-slate-900 text-white">Citizen</option>
                <option value="Police" className="bg-slate-900 text-white">Police Responder</option>
                <option value="Fire" className="bg-slate-900 text-white">Fire Department</option>
                <option value="Ambulance" className="bg-slate-900 text-white">Ambulance</option>
                <option value="Hospital" className="bg-slate-900 text-white">Hospital Authority</option>
                <option value="Government_Officer" className="bg-slate-900 text-white">Government Officer</option>
                <option value="Admin" className="bg-slate-900 text-white">System Administrator</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-4 hover:-translate-y-0.5 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-5 flex items-center">
            <div className="flex-1 border-t border-white/10"></div>
            <span className="px-3 text-xs uppercase tracking-wider text-gray-500 font-bold">or signup with</span>
            <div className="flex-1 border-t border-white/10"></div>
          </div>

          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="mt-4 w-full py-3 px-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-3 disabled:opacity-70 text-sm hover:-translate-y-0.5"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
            <span>Google Account</span>
          </button>

          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold underline decoration-dotted">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
