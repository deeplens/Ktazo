
'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { User, UserRole } from './types';
import { mockUsers } from './mock-data';
import { useRouter } from 'next/navigation';
import { getLevelForPoints } from './levels';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => boolean;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateUser: (userData: Partial<User>) => void;
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
        const parsedUser = JSON.parse(storedUser);
        parsedUser.level = getLevelForPoints(parsedUser.points);
        setUser(parsedUser);
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
      foundUser.level = getLevelForPoints(foundUser.points);
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
    // Find a user with the target role to switch to.
    // In a real app, this would be a more complex operation,
    // but for the demo, we just find the first user with that role.
    const targetUser = mockUsers.find(u => u.role === role);
    const currentUser = user;
    
    if (targetUser && currentUser) {
        // Create a new user object that is the target user, but keep the current user's name, email, photo, etc.
        const switchedUser: User = {
            ...targetUser,
            id: currentUser.id, // Keep current user's ID
            name: currentUser.name,
            email: currentUser.email,
            photoUrl: currentUser.photoUrl,
            points: currentUser.points,
            lastLoginAt: currentUser.lastLoginAt,
            authId: currentUser.authId,
            tenantId: currentUser.tenantId,
        };
        switchedUser.level = getLevelForPoints(switchedUser.points);
        setUser(switchedUser);
        sessionStorage.setItem('ktazo-user', JSON.stringify(switchedUser));
    } else if (targetUser) {
        // Fallback if there is no current user for some reason
        targetUser.level = getLevelForPoints(targetUser.points);
        setUser(targetUser);
        sessionStorage.setItem('ktazo-user', JSON.stringify(targetUser));
    }
  }


  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      updatedUser.level = getLevelForPoints(updatedUser.points);
      setUser(updatedUser);
      sessionStorage.setItem('ktazo-user', JSON.stringify(updatedUser));
      
      // Also update the master list in mock-data (for demo purposes)
      const userIndex = mockUsers.findIndex(u => u.id === user.id);
      if (userIndex > -1) {
          mockUsers[userIndex] = updatedUser;
      }
    }
  };

  const value = useMemo(() => ({ user, loading, login, logout, switchRole, updateUser }), [user, loading]);

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
