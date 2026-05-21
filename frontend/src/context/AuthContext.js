import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth as authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('forge_token');
    if (token) {
      authAPI.getMe()
        .then(res => setUser(res.data.user))
        .catch(() => localStorage.removeItem('forge_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem('forge_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    // If account is pending approval, no token is issued — return pending flag
    if (res.data.pending) {
      return { pending: true, user: res.data.user };
    }
    // Admin or auto-approved: set token and user
    if (res.data.token) {
      localStorage.setItem('forge_token', res.data.token);
      setUser(res.data.user);
    }
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('forge_token');
    setUser(null);
    toast.success('Signed out. Stay strong! 💪');
  };

  const updateUser = async (data) => {
    const res = await authAPI.updateProfile(data);
    setUser(res.data.user);
    return res.data.user;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
