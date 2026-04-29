import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUserProfile } from '../services/userService';
import { useAuth } from './AuthContext';

interface GamificationContextType {
  xp: number;
  level: number;
  streakDays: number;
  loading: boolean;
  refreshGamification: () => Promise<void>;
  progressToNextLevel: number; // 0 to 100
  xpForNextLevel: number;
  currentLevelXp: number;
}

const GamificationContext = createContext<GamificationContextType>({} as GamificationContextType);

export const GamificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [streakDays, setStreakDays] = useState(0);
  const [loading, setLoading] = useState(true);

  const refreshGamification = useCallback(async () => {
      if (!user) {
          setXp(0);
          setLevel(1);
          setStreakDays(0);
          setLoading(false);
          return;
      }

      try {
          const profile = await getUserProfile();
          setXp(profile.xp || 0);
          setLevel(profile.level || 1);
          setStreakDays(profile.streakDays || 0);
      } catch (error) {
          console.error("Erro ao carregar gamificação:", error);
      } finally {
          setLoading(false);
      }
  }, [user]);

  useEffect(() => {
      refreshGamification();
  }, [refreshGamification, user]);

  const xpForNextLevel = level * 100;
  const currentLevelXp = xp % 100;
  const progressToNextLevel = (currentLevelXp / 100) * 100;

  return (
    <GamificationContext.Provider value={{ 
        xp, 
        level, 
        streakDays, 
        loading,
        refreshGamification,
        progressToNextLevel,
        xpForNextLevel,
        currentLevelXp
    }}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => useContext(GamificationContext);
