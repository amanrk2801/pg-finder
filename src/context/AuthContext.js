import React, { createContext, useState, useEffect, useMemo, useCallback, useContext } from 'react';
import StorageService from '../services/StorageService';
import ApiClient from '../services/ApiClient';
import { generateId } from '../utils/id';
import { DataContext } from './DataContext';

export const AuthContext = createContext();

const USE_BACKEND = process.env.EXPO_PUBLIC_USE_BACKEND === 'true';

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

  const login = useCallback(async (email, password, type) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();

      // ALWAYS USE BACKEND IF ENABLED (Ensures we get a REAL token for Superadmin too)
      if (USE_BACKEND) {
        const response = await ApiClient.post('/auth/login', { email: normalizedEmail, password, type });
        const { token, user: apiUser } = response;
        
        const session = {
          userData: apiUser,
          type: apiUser.type,
          token,
        };
        await StorageService.saveUserSession(session);
        setUser(apiUser);
        setUserType(apiUser.type);

        if (dataContext?.loadAllData) {
            await dataContext.loadAllData(token, apiUser.type);
        }

        return true;
      }

      // Legacy local-only mode
      const allUsers = (await StorageService.getUsers()) || [];
      const existingUser = allUsers.find((u) => u.email === normalizedEmail);

      if (existingUser) {
        if (existingUser.type !== type && !(existingUser.type === 'pending_admin' && type === 'admin')) {
          return false;
        }
        const userData = {
          email: normalizedEmail,
          id: existingUser.id,
          name: existingUser.name || '',
          phone: existingUser.phone || '',
        };
        await StorageService.saveUserSession({ userData, type: existingUser.type });
        setUser(userData);
        setUserType(existingUser.type);
        return true;
      }
      return false;
    } catch (error) {
      console.error('AuthContext - Login error:', error);
      throw error; // Throw so UI can catch specific backend messages
    }
  }, [dataContext]);

  const register = useCallback(async (email, password, type, name, phone) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (USE_BACKEND) {
        const response = await ApiClient.post('/auth/register', { email: normalizedEmail, password, type, name, phone });
        const { token, user: apiUser } = response;
        const session = {
          userData: apiUser,
          type: apiUser.type,
          token,
        };
        await StorageService.saveUserSession(session);
        setUser(apiUser);
        setUserType(apiUser.type);

        if (dataContext?.loadAllData) {
            await dataContext.loadAllData(token, apiUser.type);
        }

        return true;
      }

      const allUsers = (await StorageService.getUsers()) || [];
      const existingUser = allUsers.find((u) => u.email === normalizedEmail);
      if (existingUser) return false;

      const assignedType = type === 'admin' ? 'pending_admin' : 'user';
      const userData = { email: normalizedEmail, id: generateId('user'), name, phone };
      allUsers.push({ ...userData, type: assignedType, status: 'active', joinedAt: new Date().toISOString() });
      await StorageService.saveUsers(allUsers);
      
      await StorageService.saveUserSession({ userData, type: assignedType });
      setUser(userData);
      setUserType(assignedType);
      return true;
    } catch (error) {
      console.error('AuthContext - Register error:', error);
      throw error;
    }
  }, [dataContext]);

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
      const newUserData = { ...user, ...updatedData };
      await StorageService.saveUserSession({ userData: newUserData, type: userType });
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
