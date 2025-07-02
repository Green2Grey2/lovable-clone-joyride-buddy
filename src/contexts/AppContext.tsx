
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUserStats } from '@/contexts/UserStatsContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  department: string;
  weeklyGoal: number;
  height?: number;
  weight?: number;
  age?: number;
  sex?: 'male' | 'female';
  joinDate: string;
}

interface UserStats {
  todaySteps: number;
  weeklySteps: number;
  monthlySteps: number;
  totalSteps: number;
  currentStreak: number;
  longestStreak: number;
  water: number;
  calories: number;
  heartRate: number;
  totalWorkouts: number;
  activeMinutes: number;
}

export interface Activity {
  id: string;
  type: 'walk' | 'run' | 'cycle' | 'workout';
  name: string;
  duration: number;
  startTime: Date;
  isActive: boolean;
  icon?: string;
  description?: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  icon: string;
}

interface DepartmentMember {
  userId: string;
  name: string;
  steps: number;
  rank: number;
}

interface Department {
  id: string;
  name: string;
  totalSteps: number;
  participantCount: number;
  averageSteps: number;
  rank: number;
  color: string;
  members: DepartmentMember[];
}

interface ChallengeData {
  departments: Department[];
  totalParticipants: number;
}

interface AppContextType {
  userProfile: UserProfile;
  userStats: UserStats;
  activeActivity: Activity | null;
  achievements: Achievement[];
  challengeData: ChallengeData;
  setActiveActivity: (activity: Activity | null) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateUserStats: (updates: Partial<UserStats>) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateStats: (updates: Partial<UserStats>) => Promise<void>;
  startActivity: (activity: Activity) => void;
  stopActivity: () => void;
  updateUserSteps: (steps: number) => Promise<void>;
  getDashboardGreeting: () => { message: string; emoji: string };
  getMotivationalMessage: () => { type: string; emoji: string; message: string; color: string; };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { stats, updateStats: updateCentralStats } = useUserStats();
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: '',
    name: 'User',
    email: '',
    department: 'Fitness',
    weeklyGoal: 70000, // 10 miles per day * 7 days in steps (2000 steps per mile)
    height: 0,
    weight: 0,
    age: 25,
    sex: 'male',
    joinDate: 'January 2024'
  });
  const [activeActivity, setActiveActivity] = useState<Activity | null>(null);

  // Mock achievements data
  const achievements: Achievement[] = [
    { id: '1', name: 'First Steps', description: 'Complete your first workout', earned: true, icon: '🎯' },
    { id: '2', name: 'Week Warrior', description: 'Complete 7 days in a row', earned: false, icon: '🔥' },
    { id: '3', name: 'Step Master', description: 'Reach 10,000 steps in a day', earned: true, icon: '👑' }
  ];

  // Mock challenge data with proper members array
  const challengeData: ChallengeData = {
    departments: [
      { 
        id: '1', 
        name: 'Engineering', 
        totalSteps: 45000, 
        participantCount: 12, 
        averageSteps: 3750, 
        rank: 1, 
        color: 'from-blue-400 to-blue-600', 
        members: [
          { userId: '1', name: 'John Doe', steps: 8500, rank: 1 },
          { userId: '2', name: 'Jane Smith', steps: 7200, rank: 2 },
          { userId: '3', name: 'Mike Johnson', steps: 6800, rank: 3 },
          { userId: '4', name: 'Sarah Wilson', steps: 6200, rank: 4 },
          { userId: '5', name: 'Tom Brown', steps: 5900, rank: 5 }
        ]
      },
      { 
        id: '2', 
        name: 'Marketing', 
        totalSteps: 38000, 
        participantCount: 8, 
        averageSteps: 4750, 
        rank: 2, 
        color: 'from-green-400 to-green-600', 
        members: [
          { userId: '6', name: 'Lisa Davis', steps: 9200, rank: 1 },
          { userId: '7', name: 'Chris Lee', steps: 8100, rank: 2 },
          { userId: '8', name: 'Amy Chen', steps: 7500, rank: 3 },
          { userId: '9', name: 'David Kim', steps: 6900, rank: 4 },
          { userId: '10', name: 'Emma White', steps: 6300, rank: 5 }
        ]
      },
      { 
        id: '3', 
        name: 'Sales', 
        totalSteps: 32000, 
        participantCount: 10, 
        averageSteps: 3200, 
        rank: 3, 
        color: 'from-purple-400 to-purple-600', 
        members: [
          { userId: '11', name: 'Alex Rodriguez', steps: 7800, rank: 1 },
          { userId: '12', name: 'Maria Garcia', steps: 7100, rank: 2 },
          { userId: '13', name: 'Ryan Taylor', steps: 6600, rank: 3 },
          { userId: '14', name: 'Jessica Moore', steps: 6000, rank: 4 },
          { userId: '15', name: 'Kevin Zhang', steps: 5500, rank: 5 }
        ]
      }
    ],
    totalParticipants: 30
  };

  // Convert centralized stats to app stats format with US metrics
  const userStats: UserStats = {
    todaySteps: stats?.today_steps || 0,
    weeklySteps: stats?.weekly_steps || 0,
    monthlySteps: (stats?.weekly_steps || 0) * 4,
    totalSteps: (stats?.weekly_steps || 0) * 12,
    currentStreak: stats?.current_streak || 0,
    longestStreak: Math.max(stats?.current_streak || 0, 5),
    water: stats?.water_intake || 0,
    calories: stats?.calories_burned || 0,
    heartRate: stats?.heart_rate || 75,
    totalWorkouts: Math.floor((stats?.today_steps || 0) / 1000),
    activeMinutes: Math.floor((stats?.today_steps || 0) / 100)
  };

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setUserProfile({
        id: data.id,
        name: data.name || 'User',
        email: data.email || '',
        department: data.department || 'Fitness',
        weeklyGoal: data.weekly_goal || 70000, // Default to 10 miles per day * 7 days
        height: Number(data.height) || 0,
        weight: Number(data.weight) || 0,
        age: Number(data.age) || 25,
        sex: 'male',
        joinDate: data.join_date || 'January 2024'
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          email: updates.email,
          department: updates.department,
          weekly_goal: updates.weeklyGoal,
          height: String(updates.height || 0),
          weight: String(updates.weight || 0)
        })
        .eq('id', user.id);

      if (error) throw error;

      setUserProfile(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const updateUserStats = async (updates: Partial<UserStats>) => {
    const centralUpdates = {
      today_steps: updates.todaySteps,
      weekly_steps: updates.weeklySteps,
      current_streak: updates.currentStreak,
      water_intake: updates.water,
      calories_burned: updates.calories,
      heart_rate: updates.heartRate
    };

    const filteredUpdates = Object.fromEntries(
      Object.entries(centralUpdates).filter(([_, value]) => value !== undefined)
    );

    await updateCentralStats(filteredUpdates);
  };

  const updateUserSteps = async (steps: number) => {
    await updateCentralStats({ today_steps: steps });
  };

  const startActivity = (activity: Activity) => {
    setActiveActivity({
      ...activity,
      startTime: new Date(),
      isActive: true
    });
  };

  const stopActivity = () => {
    setActiveActivity(null);
  };

  const getDashboardGreeting = () => {
    const hour = new Date().getHours();
    const streak = userStats.currentStreak;
    
    if (hour < 12) {
      return { 
        message: streak > 0 ? `Good morning! Day ${streak} of your streak! 🔥` : "Good morning! Ready to start your day?", 
        emoji: "🌅" 
      };
    } else if (hour < 17) {
      return { 
        message: streak > 0 ? `Good afternoon! Keep that ${streak}-day streak alive!` : "Good afternoon! How's your progress today?", 
        emoji: "☀️" 
      };
    } else {
      return { 
        message: streak > 0 ? `Good evening! ${streak} days strong!` : "Good evening! How did you do today?", 
        emoji: "🌙" 
      };
    }
  };

  const getMotivationalMessage = () => {
    const messages = [
      { type: 'success', emoji: '💪', message: "You're doing amazing! Keep it up!", color: 'from-green-400 to-green-600' },
      { type: 'progress', emoji: '🎯', message: "Every step counts towards your goal!", color: 'from-blue-400 to-blue-600' },
      { type: 'streak', emoji: '🔥', message: "Consistency is key to success!", color: 'from-orange-400 to-orange-600' },
      { type: 'motivation', emoji: '💫', message: "You're stronger than you think!", color: 'from-purple-400 to-purple-600' }
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  return (
    <AppContext.Provider value={{
      userProfile,
      userStats,
      activeActivity,
      achievements,
      challengeData,
      setActiveActivity,
      updateUserProfile,
      updateUserStats,
      updateProfile: updateUserProfile,
      updateStats: updateUserStats,
      startActivity,
      stopActivity,
      updateUserSteps,
      getDashboardGreeting,
      getMotivationalMessage
    }}>
      {children}
    </AppContext.Provider>
  );
};
