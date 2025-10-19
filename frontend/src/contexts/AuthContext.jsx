'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/services/api';
import { STORAGE_KEYS, SUCCESS_MESSAGES } from '@/utils/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);

        // Check if stored values are valid (not "undefined" string)
        if (storedToken && storedToken !== 'undefined' &&
            storedUser && storedUser !== 'undefined') {
          try {
            const parsedUser = JSON.parse(storedUser);
            setToken(storedToken);
            setUser(parsedUser);

            // Verify token is still valid
            try {
              const response = await authAPI.me();
              // Backend returns {success, data: {user}}
              const userData = response.data?.user || response.user;
              setUser(userData);
              localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
            } catch (error) {
              // Token invalid, clear auth
              console.error('Token validation failed:', error);
              clearAuth();
            }
          } catch (parseError) {
            // Invalid JSON in storage, clear it
            console.error('Failed to parse stored user data:', parseError);
            clearAuth();
          }
        } else {
          // Clear any invalid stored data
          clearAuth();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Clear authentication state
   */
  const clearAuth = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  };

  /**
   * Login user
   * @param {string} email
   * @param {string} password
   */
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authAPI.login(email, password);

      // Backend returns {success, data: {user, token}}
      const { user, token } = response.data;

      // Store token and user data
      setToken(token);
      setUser(user);
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      return {
        success: true,
        message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
        user: user
      };
    } catch (error) {
      setError(error.message || 'Login failed');
      throw error;
    }
  };

  /**
   * Register new user
   * @param {Object} userData - {email, password, name, role, walletAddress?}
   */
  const register = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);

      // Backend returns {success, data: {user, token}}
      const { user, token } = response.data;

      // Store token and user data
      setToken(token);
      setUser(user);
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      return {
        success: true,
        message: SUCCESS_MESSAGES.REGISTER_SUCCESS,
        user: user
      };
    } catch (error) {
      setError(error.message || 'Registration failed');
      throw error;
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    authAPI.logout();
    clearAuth();
    // Redirect to home page
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  /**
   * Update user data
   * @param {Object} updates - User data updates
   */
  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user && !!token,
    isManufacturer: user?.role === 'MANUFACTURER',
    isLogistics: user?.role === 'LOGISTICS',
    isRetailer: user?.role === 'RETAILER',
    isConsumer: user?.role === 'CONSUMER'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to use Auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export default AuthContext;
