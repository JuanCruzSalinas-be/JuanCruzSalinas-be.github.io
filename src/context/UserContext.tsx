import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '../types';
import { useAuth } from './AuthContext';

interface UserContextType {
  gainXP: (amount: number) => void;
  levelUp: () => void;
}

const UserContext = createContext<UserContextType>({
  gainXP: () => {},
  levelUp: () => {}
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  const gainXP = (amount: number) => {
    if (!isAuthenticated || !user) return;
    
    // Update user with new XP
    const updatedUser = { 
      ...user, 
      xp: user.xp + amount
    };
    
    // Check if user should level up
    if (updatedUser.xp >= updatedUser.xpToNextLevel) {
      updatedUser.level += 1;
      updatedUser.xp = updatedUser.xp - updatedUser.xpToNextLevel;
      updatedUser.xpToNextLevel = Math.floor(updatedUser.xpToNextLevel * 1.5); // Increase XP needed for next level
    }
    
    // Update localStorage
    localStorage.setItem('memoryLaneUser', JSON.stringify(updatedUser));
    
    // Force a refresh by reloading the page (in a real app, we'd use state management)
    window.location.reload();
  };
  
  const levelUp = () => {
    if (!isAuthenticated || !user) return;
    
    // Level up user
    const updatedUser = {
      ...user,
      level: user.level + 1,
      xp: 0,
      xpToNextLevel: Math.floor(user.xpToNextLevel * 1.5) // Increase XP needed for next level
    };
    
    // Update localStorage
    localStorage.setItem('memoryLaneUser', JSON.stringify(updatedUser));
    
    // Force a refresh by reloading the page
    window.location.reload();
  };

  return (
    <UserContext.Provider value={{ gainXP, levelUp }}>
      {children}
    </UserContext.Provider>
  );
};