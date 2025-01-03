import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import apiClient from '@/lib/api-client';

interface AuthContextType {
  isAuthenticated: boolean | null;
  authenticatedUser: string;
  login: (token: string) => void;
  logout: () => void;
  validateToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<string>('');
  const [lastChecked, setLastChecked] = useState<number>(Date.now());

  const validateToken = useCallback(async () => {
    const token = localStorage.getItem('token');
    const now = Date.now();

    if (!token) {
      console.log('No token in headers - Setting auth to false');
      setIsAuthenticated(false);
      return;
    }

    console.log(
      `Auth: ${isAuthenticated}, Remaining Time: ${
        60000 - (now - lastChecked)
      }ms`,
    );

    if (isAuthenticated === true && now - lastChecked < 60000) {
      return;
    }

    try {
      const response = await apiClient.get('/user/verify-token');
      setAuthenticatedUser(response.data.username);
      setIsAuthenticated(true);
      console.log(`Logged in as ${authenticatedUser}`);
    } catch (error) {
      setIsAuthenticated(false);
      console.error('Token validation failed:', error);
    } finally {
      setLastChecked(now);
    }
  }, [authenticatedUser, isAuthenticated, lastChecked]);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  useEffect(() => {
    validateToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        authenticatedUser,
        login,
        logout,
        validateToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
