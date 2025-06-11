import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';

interface UserContextType {
  gainXP: (amount: number) => Promise<void>;
  levelUp: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  gainXP: async () => {},
  levelUp: async () => {}
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateUserProgress } = useAuth();
  
  const gainXP = async (amount: number) => {
    if (!user) return;
    
    const newXp = user.xp + amount;
    let newLevel = user.level;
    let newXpToNextLevel = user.xpToNextLevel;
    
    // Check if user should level up
    if (newXp >= user.xpToNextLevel) {
      newLevel += 1;
      const remainingXp = newXp - user.xpToNextLevel;
      newXpToNextLevel = Math.floor(user.xpToNextLevel * 1.5);
      await updateUserProgress(remainingXp, newLevel, newXpToNextLevel);
    } else {
      await updateUserProgress(newXp, newLevel, newXpToNextLevel);
    }
  };
  
  const levelUp = async () => {
    if (!user) return;
    
    const newLevel = user.level + 1;
    const newXpToNextLevel = Math.floor(user.xpToNextLevel * 1.5);
    await updateUserProgress(0, newLevel, newXpToNextLevel);
  };

  return (
    <UserContext.Provider value={{ gainXP, levelUp }}>
      {children}
    </UserContext.Provider>
  );
};