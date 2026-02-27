import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import StorageService from '../services/StorageService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  // Added loading state to handle the initial app launch
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const session = await StorageService.getUserSession();
      if (session) {
        setUser(session.userData);
        setUserType(session.type);
      }
    } catch (error) {
      console.error('AuthContext - Error loading user:', error);
    } finally {
      // Ensure the app knows we're done checking, even if it failed
      setIsLoading(false);
    }
  };

  const login = useCallback(async (email, password, type) => {
    try {
      if (email === 'superadmin@pg.com' && password === 'admin123') {
        const adminData = { email, id: 'superadmin_1', name: 'Super Admin' };
        await StorageService.saveUserSession({ userData: adminData, type: 'superadmin' });
        setUser(adminData);
        setUserType('superadmin');
        return true;
      }

      const allUsers = await StorageService.getUsers() || [];
      const existingUser = allUsers.find(u => u.email === email);

      let userData;
      if (existingUser) {
        userData = { email, id: existingUser.id, name: existingUser.name || '', phone: existingUser.phone || '' };
        if (existingUser.type !== type) {
          const updated = allUsers.map(u => u.email === email ? { ...u, type } : u);
          await StorageService.saveUsers(updated);
        }
      } else {
        userData = { email, id: Date.now().toString() };
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

  // Context value is stable unless user state or loading state changes
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