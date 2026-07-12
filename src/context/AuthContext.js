import React, { createContext, useState, useEffect, useMemo, useCallback, useContext } from 'react';
import StorageService from '../services/StorageService';
import ApiClient from '../services/ApiClient';
import { DataContext } from './DataContext';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const dataContext = useContext(DataContext);

  const loadUser = useCallback(async () => {
    try {
      const session = await StorageService.getUserSession();
      if (session) {
        setUser(session.userData);
        setUserType(session.type);
      }
    } catch (error) {
      console.error('AuthContext - Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const startSession = useCallback(async ({ token, user: apiUser }) => {
    await StorageService.saveUserSession({ userData: apiUser, type: apiUser.type, token });
    setUser(apiUser);
    setUserType(apiUser.type);

    if (dataContext?.loadAllData) {
      await dataContext.loadAllData(token, apiUser.type);
    }
  }, [dataContext]);

  const login = useCallback(async (email, password, type) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const response = await ApiClient.post('/auth/login', { email: normalizedEmail, password, type });
      await startSession(response);
      return true;
    } catch (error) {
      console.warn('AuthContext - Login error:', error.message);
      throw error; // Throw so UI can catch specific backend messages
    }
  }, [startSession]);

  const register = useCallback(async (email, password, type, name, phone, ownerDocs = {}) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const response = await ApiClient.post('/auth/register', {
        email: normalizedEmail, password, type, name, phone,
        ...(type === 'admin' ? ownerDocs : {}),
      });
      await startSession(response);
      return true;
    } catch (error) {
      console.warn('AuthContext - Register error:', error.message);
      throw error;
    }
  }, [startSession]);

  const logout = useCallback(async () => {
    try {
      await StorageService.removeUserSession();
      setUser(null);
      setUserType(null);
    } catch (error) {
      console.error('AuthContext - Logout error:', error);
    }
  }, []);

  const updateUserProfile = useCallback(async (updatedData) => {
    try {
      const session = await StorageService.getUserSession();
      const newUserData = { ...user, ...updatedData };
      await StorageService.saveUserSession({ ...session, userData: newUserData, type: userType });
      setUser(newUserData);
      return true;
    } catch (error) {
      console.error('AuthContext - Update Profile error:', error);
      return false;
    }
  }, [user, userType]);

  const contextValue = useMemo(() => ({
    user,
    userType,
    isLoading,
    login,
    register,
    logout,
    updateUserProfile,
  }), [user, userType, isLoading, login, register, logout, updateUserProfile]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
