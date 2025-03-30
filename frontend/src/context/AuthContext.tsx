import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { getProfile } from '../api/auth';

interface User {
  id: string;
  email: string;
  fullName: string;
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  logout: () => void;
  fetchError: boolean;
  refreshUser: () => Promise<void>;
}

// Provide default values for the context
const defaultContext: AuthContextType = {
  user: null,
  setUser: () => {},
  loading: true,
  logout: () => {},
  fetchError: false,
  refreshUser: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContext);

// Custom hook for using auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<boolean>(false);

  const refreshUser = async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const res = await getProfile();
      setUser(res.data);
      setFetchError(false);
    } catch (err) {
      console.log("Profile fetch error:", err);
      setUser(null);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    window.location.href = '/login'; // Use window.location instead of useNavigate
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      loading, 
      logout, 
      fetchError,
      refreshUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};