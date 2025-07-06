import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { activityTrackingService } from '@/utils/activityTrackingService';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

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
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Setup real-time subscription
  useEffect(() => {
    if (!user) {
      setStats(null);
      setLoading(false);
      return;
    }

    fetchStats();

    // Set up real-time subscription for user_stats changes
    console.log('🔌 UserStatsContext: Setting up real-time subscription for user:', user.id);
    
    const statsChannel = supabase
      .channel(`user-stats-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'user_stats',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('📡 UserStatsContext: Real-time update received:', payload);
          
          if (payload.eventType === 'UPDATE' && payload.new) {
            // Update stats with the new data
            const newStats = payload.new as UserStats;
            setStats(prevStats => ({
              ...prevStats,
              ...newStats,
              last_updated: new Date().toISOString()
            }));
            
            // Show a subtle notification for real-time updates
            console.log('✨ UserStatsContext: Stats updated in real-time');
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('📡 UserStatsContext: Activity change detected:', payload.eventType);
          // When activities change, refresh stats (trigger will update user_stats)
          // Add a small delay to ensure database trigger has completed
          setTimeout(() => {
            fetchStats();
          }, 500);
        }
      )
      .subscribe((status) => {
        console.log('📻 UserStatsContext: Subscription status:', status);
      });

    setChannel(statsChannel);

    // Cleanup subscription on unmount
    return () => {
      console.log('🔌 UserStatsContext: Cleaning up real-time subscription');
      if (statsChannel) {
        supabase.removeChannel(statsChannel);
      }
    };
  }, [user]);

  const fetchStats = async () => {
    console.log('📊 UserStatsContext: fetchStats called, user:', user?.id);
    
    if (!user) {
      console.log('👤 UserStatsContext: No user, setting stats to null');
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 UserStatsContext: Calling activityTrackingService.getUserStats');
      // Use the new activity tracking service instead of direct Supabase calls
      const userStats = await activityTrackingService.getUserStats(user.id);
      
      console.log('📈 UserStatsContext: getUserStats result:', userStats);
      
      if (userStats) {
        console.log('✅ UserStatsContext: Setting stats:', userStats);
        setStats(userStats);
      } else {
        console.log('🆕 UserStatsContext: No stats found, creating initial stats');
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
      console.error('❌ UserStatsContext: Error fetching stats:', error);
      toast.error('Failed to load user statistics');
    } finally {
      setLoading(false);
    }
  };

  const updateStats = async (updates: Partial<UserStats>) => {
    if (!user) return;

    // Optimistic update for immediate UI feedback
    setStats(prevStats => {
      if (!prevStats) return prevStats;
      console.log('⚡ UserStatsContext: Applying optimistic update:', updates);
      return {
        ...prevStats,
        ...updates,
        last_updated: new Date().toISOString()
      };
    });

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
      
      // Revert optimistic update on error
      console.log('⚠️ UserStatsContext: Reverting optimistic update due to error');
      await fetchStats();
    }
  };

  const refreshStats = useCallback(async () => {
    console.log('🔄 UserStatsContext: refreshStats called');
    await fetchStats();
    console.log('✅ UserStatsContext: refreshStats completed');
  }, [user]);

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
