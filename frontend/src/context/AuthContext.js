import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { userAPI } from '../utils/api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    return storedUser && token ? { ...JSON.parse(storedUser), token } : null;
  });

  const fetchUserData = useCallback(async () => {
    try {
      const response = await userAPI.getCurrentUser();
      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(prev => ({ ...prev, ...userData }));
      return userData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      fetchUserData();
    }
  }, [fetchUserData, user]);

  const login = async (token, userData) => {
    localStorage.setItem('token', token);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser({ ...userData, token });
    } else {
      const userData = await fetchUserData();
      setUser(prev => ({ ...prev, token, ...userData }));
    }
  };

  const updateUser = (updatedData) => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const newUserData = { ...currentUser, ...updatedData };
    localStorage.setItem('user', JSON.stringify(newUserData));
    setUser(prev => ({ ...prev, ...newUserData }));
    return newUserData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      updateUser,
      isAuthenticated: !!user?.token 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
