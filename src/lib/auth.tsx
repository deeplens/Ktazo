'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { User, UserRole } from './types';
import { mockUsers } from './mock-data';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => boolean;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate checking for a logged-in user in a session
    try {
      const storedUser = sessionStorage.getItem('ktazo-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Could not parse stored user", e);
    } finally {
        setLoading(false);
    }
  }, []);


  const login = (email: string) => {
    const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) {
      setUser(foundUser);
      sessionStorage.setItem('ktazo-user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('ktazo-user');
    router.push('/');
  };

  const switchRole = (role: UserRole) => {
    const foundUser = mockUsers.find(u => u.role === role);
    if(foundUser) {
        setUser(foundUser);
        sessionStorage.setItem('ktazo-user', JSON.stringify(foundUser));
    }
  }

  const value = useMemo(() => ({ user, loading, login, logout, switchRole }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
