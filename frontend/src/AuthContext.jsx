import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('payroll_user');
    const token = localStorage.getItem('payroll_token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    localStorage.setItem('payroll_token', res.data.token);
    localStorage.setItem('payroll_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('payroll_token');
    localStorage.removeItem('payroll_user');
    setUser(null);
  };

  const isAdmin = () => user?.role === 'admin';
  const isHR = () => user?.role === 'admin' || user?.role === 'hr';

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin, isHR }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
