import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';
import { loginWithBackend, devLoginWithBackend } from '../services/authService';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (idToken: string, role?: string, name?: string, phone?: string) => Promise<void>;
  devLogin: (role?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (!fbUser) {
        setUser(null);
        localStorage.removeItem('user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (idToken: string, role?: string, name?: string, phone?: string) => {
    setLoading(true);
    try {
      const userData = await loginWithBackend(idToken, role, name, phone);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const devLogin = async (role?: string) => {
    setLoading(true);
    const targetRole = role || 'Citizen';
    try {
      const userData = await devLoginWithBackend(targetRole);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.warn('Backend dev-login endpoint unreachable, using client-side fallback:', error);
      const mockUser: User = {
        _id: `dev-id-${targetRole.toLowerCase()}`,
        name: `Dev ${targetRole.replace('_', ' ')}`,
        email: `dev@${targetRole.toLowerCase()}.com`,
        role: targetRole,
        phone: '555-0199',
        token: `mock-dev-jwt-token-${targetRole.toLowerCase()}`
      };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try { await firebaseSignOut(auth); } catch(e) {}
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, devLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
