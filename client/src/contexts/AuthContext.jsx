/**
 * Auth Context
 * Manages user authentication state with JWT tokens
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const API_BASE = '/api';
const TOKEN_KEY = 'atelier_token';
const USER_KEY = 'atelier_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is new (created within 24 hours)
  const isNewUser = useCallback(() => {
    if (!user?.createdAt) return false;
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return new Date(user.createdAt) > oneDayAgo;
  }, [user]);

  // Check user role
  const isVIP = useCallback(() => user?.role === 'VIP' || user?.role === 'ADMIN', [user]);
  const isAdmin = useCallback(() => user?.role === 'ADMIN', [user]);
  const hasRole = useCallback((roles) => {
    if (!user) return false;
    return Array.isArray(roles) ? roles.includes(user.role) : user.role === roles;
  }, [user]);

  // Get auth headers
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  // Fetch current user from token
  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      } else {
        // Token invalid, clear storage
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
      }
    } catch (err) {
      console.error('Auth fetch error:', err);
      // Try to use cached user
      const cached = localStorage.getItem(USER_KEY);
      if (cached) {
        try {
          setUser(JSON.parse(cached));
        } catch {
          setUser(null);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Login
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Register
  const register = async (email, password, name) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setError(null);
  };

  // Update preferences (for Style Quiz)
  const updatePreferences = async (preferences) => {
    try {
      const response = await fetch(`${API_BASE}/auth/preferences`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ preferences })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update preferences');
      }

      setUser(data.user);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Upgrade to VIP (demo)
  const upgradeToVIP = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/upgrade-vip`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upgrade failed');
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Initialize auth on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isNewUser,
    isVIP,
    isAdmin,
    hasRole,
    login,
    register,
    logout,
    updatePreferences,
    upgradeToVIP,
    getAuthHeaders,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
