import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { activityTrackingService } from '@/utils/activityTrackingService';
import { toast } from 'sonner';

interface UserStats {
  today_steps: number;
  weekly_steps: number;
  monthly_steps: number;
  lifetime_steps: number;
  current_streak: number;
  water_intake: number;
  calories_burned: number;
  heart_rate: number;
  last_updated: string;
}

interface UserStatsContextType {
  stats: UserStats | null;
  loading: boolean;
  updateStats: (updates: Partial<UserStats>) => Promise<void>;
  refreshStats: () => Promise<void>;
}

const UserStatsContext = createContext<UserStatsContextType | undefined>(undefined);

export const useUserStats = () => {
  const context = useContext(UserStatsContext);
  if (context === undefined) {
    throw new Error('useUserStats must be used within a UserStatsProvider');
  }
  return context;
};

interface UserStatsProviderProps {
  children: ReactNode;
}

export const UserStatsProvider: React.FC<UserStatsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    if (!user) {
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      // Use the new activity tracking service instead of direct Supabase calls
      const userStats = await activityTrackingService.getUserStats(user.id);
      
      if (userStats) {
        setStats(userStats);
      } else {
        // Create initial stats if none exist
        setStats({
          today_steps: 0,
          weekly_steps: 0,
          monthly_steps: 0,
          lifetime_steps: 0,
          current_streak: 0,
          water_intake: 0,
          calories_burned: 0,
          heart_rate: 75,
          last_updated: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load user statistics');
    } finally {
      setLoading(false);
    }
  };

  const updateStats = async (updates: Partial<UserStats>) => {
    if (!user) return;

    try {
      // For water intake, use the activity tracking service method
      if ('water_intake' in updates) {
        await activityTrackingService.updateWaterIntake(updates.water_intake);
      }
      
      // For other updates, we'd need to extend the service or handle separately
      // For now, keep this simple and just refetch stats
      await fetchStats();
    } catch (error) {
      console.error('Error updating stats:', error);
      toast.error('Failed to update statistics');
    }
  };

  const refreshStats = async () => {
    await fetchStats();
  };

  const value: UserStatsContextType = {
    stats,
    loading,
    updateStats,
    refreshStats
  };

  return (
    <UserStatsContext.Provider value={value}>
      {children}
    </UserStatsContext.Provider>
  );
};
