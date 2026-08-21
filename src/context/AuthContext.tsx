import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  availableUsers: User[];
  role: Role;
  login: (email: string, role?: string) => Promise<void>;
  switchUser: (userId: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  async function fetchCurrentUser() {
    try {
      setLoading(true);
      const data = await api.getMe();
      if (data.user) {
        setUser(data.user);
        setAvailableUsers(data.availableUsers || []);
      }
    } catch (err) {
      console.error('Failed to load user', err);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, role?: string) {
    try {
      const data = await api.login(email, role);
      setUser(data.user);
    } catch (err) {
      console.error('Login error', err);
    }
  }

  async function switchUser(userId: string) {
    try {
      const data = await api.switchDemoUser(userId);
      if (data.success) {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Switch user error', err);
    }
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        availableUsers,
        role: user ? user.role : 'PROCUREMENT_OFFICER',
        login,
        switchUser,
        logout,
        loading,
      }}
    >
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
