import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, PersonalInfo } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updatePersonalInfo: (info: PersonalInfo) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  loading: true,
  updatePersonalInfo: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('memoryLaneUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // For demo, we'll create a mock user
    const mockUser: User = {
      id: '1',
      name: email.split('@')[0],
      level: 0,
      xp: 0,
      xpToNextLevel: 100
    };
    
    setUser(mockUser);
    localStorage.setItem('memoryLaneUser', JSON.stringify(mockUser));
  };

  const register = async (name: string, email: string, password: string) => {
    // For demo, we'll create a mock user
    const mockUser: User = {
      id: '1',
      name,
      level: 0,
      xp: 0,
      xpToNextLevel: 100
    };
    
    setUser(mockUser);
    localStorage.setItem('memoryLaneUser', JSON.stringify(mockUser));
  };

  const updatePersonalInfo = (info: PersonalInfo) => {
    if (user) {
      const updatedUser = {
        ...user,
        personalInfo: info
      };
      setUser(updatedUser);
      localStorage.setItem('memoryLaneUser', JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('memoryLaneUser');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      register, 
      logout,
      loading,
      updatePersonalInfo
    }}>
      {children}
    </AuthContext.Provider>
  );
};