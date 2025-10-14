// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

interface User {
  id: string;
  email: string;
  username?: string;
  is_active: boolean;
  is_superuser: boolean;
}

interface RegisterResult {
  success: boolean;
  autoLoginFailed?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  register: (email: string, password: string, username?: string) => Promise<RegisterResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if token exists and is not expired
        const isValid = await authService.checkAuth();
        if (isValid) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          
          // Log token expiration info
          const expiration = authService.getTokenExpiration();
          if (expiration) {
            console.log('Token expires at:', expiration.toLocaleString());
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        authService.logout();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const register = async (email: string, password: string, username?: string): Promise<RegisterResult> => {
    setIsLoading(true);
    try {
      const result = await authService.register(email, password, username);
      
      if (result.autoLoginSuccess) {
        // Auto-login succeeded
        setUser(result.user);
        
        // Log token expiration
        const expiration = authService.getTokenExpiration();
        if (expiration) {
          console.log('Registered and logged in. Token expires at:', expiration.toLocaleString());
        }
        
        return { success: true };
      } else {
        // Registration succeeded but auto-login failed
        console.log('Registration succeeded, but auto-login failed. User needs to login manually.');
        return { success: true, autoLoginFailed: true };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const loggedInUser = await authService.login(email, password);
      setUser(loggedInUser);
      
      // Log token expiration
      const expiration = authService.getTokenExpiration();
      if (expiration) {
        console.log('Logged in. Token expires at:', expiration.toLocaleString());
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const checkAuth = async (): Promise<boolean> => {
    try {
      const isValid = await authService.checkAuth();
      if (!isValid) {
        setUser(null);
        return false;
      }
      
      // Refresh user data if we don't have it
      if (!user) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      }
      return true;
    } catch {
      setUser(null);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.is_superuser ?? false,
        isLoading,
        login,
        logout,
        checkAuth,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};