import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import StorageService from '../services/StorageService';
import { AUTH_CONFIG } from '../constants/auth';
import ApiClient from '../services/ApiClient';
import { generateId } from '../utils/id';

export const AuthContext = createContext();

const USE_BACKEND = process.env.EXPO_PUBLIC_USE_BACKEND === 'true';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

      // Superadmin stays env-based, same as before
      if (
        type === 'superadmin' &&
        AUTH_CONFIG.isSuperAdminEnabled &&
        normalizedEmail === AUTH_CONFIG.superAdminEmail?.toLowerCase() &&
        password === AUTH_CONFIG.superAdminPassword
      ) {
        const adminData = { email: normalizedEmail, id: 'superadmin_1', name: 'Super Admin' };
        await StorageService.saveUserSession({ userData: adminData, type: 'superadmin' });
        setUser(adminData);
        setUserType('superadmin');
        return true;
      }

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
        return true;
      }

      // Legacy local-only mode (no backend)
      const allUsers = (await StorageService.getUsers()) || [];
      const existingUser = allUsers.find((u) => u.email === normalizedEmail);

      let userData;
      if (existingUser) {
        if (existingUser.type !== type) {
          return false;
        }
        userData = {
          email: normalizedEmail,
          id: existingUser.id,
          name: existingUser.name || '',
          phone: existingUser.phone || '',
        };
      } else {
        userData = { email: normalizedEmail, id: generateId('user') };
        allUsers.push({ ...userData, type, status: 'active', joinedAt: new Date().toISOString() });
        await StorageService.saveUsers(allUsers);
      }

      await StorageService.saveUserSession({ userData, type });
      setUser(userData);
      setUserType(type);
      return true;
    } catch (error) {
      console.error('AuthContext - Login error:', error);
      return false;
    }
  }, []);

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
    logout,
    updateUserProfile,
  }), [user, userType, isLoading, login, logout, updateUserProfile]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
