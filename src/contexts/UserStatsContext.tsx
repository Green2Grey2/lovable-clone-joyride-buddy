
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UserStats {
  id: string;
  user_id: string;
  today_steps: number;
  weekly_steps: number;
  current_streak: number;
  water_intake: number;
  calories_burned: number;
  heart_rate: number;
  last_updated: string;
}

interface UserStatsContextType {
  stats: UserStats | null;
  loading: boolean;
  updateStats: (updates: Partial<Omit<UserStats, 'id' | 'user_id' | 'last_updated'>>) => Promise<void>;
  refreshStats: () => Promise<void>;
}

const UserStatsContext = createContext<UserStatsContextType | undefined>(undefined);

export const useUserStats = () => {
  const context = useContext(UserStatsContext);
  if (!context) {
    throw new Error('useUserStats must be used within a UserStatsProvider');
  }
  return context;
};

export const UserStatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    if (!user) {
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If no stats exist, create them
        if (error.code === 'PGRST116') {
          try {
            const { data: newStats, error: insertError } = await supabase
              .from('user_stats')
              .insert([{
                user_id: user.id,
                today_steps: 0,
                weekly_steps: 0,
                current_streak: 0,
                water_intake: 0,
                calories_burned: 0,
                heart_rate: 75
              }])
              .select()
              .single();

            if (insertError) {
              console.error('Error creating user stats:', insertError);
              toast.error('Failed to initialize user statistics');
              return;
            }
            setStats(newStats);
            toast.success('User statistics initialized');
          } catch (insertError) {
            console.error('Error creating user stats:', insertError);
            toast.error('Failed to initialize user statistics');
          }
        } else {
          console.error('Error fetching user stats:', error);
          toast.error('Failed to load user statistics');
        }
      } else {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      toast.error('Failed to load user statistics');
    } finally {
      setLoading(false);
    }
  };

  const updateStats = async (updates: Partial<Omit<UserStats, 'id' | 'user_id' | 'last_updated'>>) => {
    if (!user || !stats) {
      console.warn('Cannot update stats: user or stats not available');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_stats')
        .update({
          ...updates,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating user stats:', error);
        toast.error('Failed to update statistics');
        return;
      }
      
      setStats(data);
      toast.success('Statistics updated successfully');
    } catch (error) {
      console.error('Error updating user stats:', error);
      toast.error('Failed to update statistics');
    }
  };

  const refreshStats = async () => {
    setLoading(true);
    await fetchStats();
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  // Set up real-time subscription for stats updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user-stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_stats',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setStats(payload.new as UserStats);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <UserStatsContext.Provider value={{
      stats,
      loading,
      updateStats,
      refreshStats
    }}>
      {children}
    </UserStatsContext.Provider>
  );
};
