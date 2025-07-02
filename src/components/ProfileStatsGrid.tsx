
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Calendar, Flame, Award } from 'lucide-react';

interface ProfileStatsGridProps {
  userStats: {
    totalSteps: number;
    totalWorkouts: number;
    currentStreak: number;
    longestStreak: number;
  };
}

// This component is now used primarily in the Activity page for detailed stats
export const ProfileStatsGrid = React.memo(({ userStats }: ProfileStatsGridProps) => {
  const stats = [
    {
      icon: Target,
      value: userStats.totalSteps.toLocaleString(),
      label: 'Total Steps',
      gradient: 'from-[#735CF7] to-[#00A3FF]'
    },
    {
      icon: Calendar,
      value: userStats.totalWorkouts,
      label: 'Workouts',
      gradient: 'from-[#FF7B5A] to-[#FF6B4A]'
    },
    {
      icon: Flame,
      value: userStats.currentStreak,
      label: 'Day Streak',
      gradient: 'from-[#FF7B5A] to-[#FFD700]'
    },
    {
      icon: Award,
      value: userStats.longestStreak,
      label: 'Best Streak',
      gradient: 'from-[#FFD700] to-[#FFA500]'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="bg-white border-0 rounded-3xl shadow-[0px_10px_30px_rgba(115,92,247,0.1)]">
            <CardContent className="p-6 text-center">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                <IconComponent className="h-6 w-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#1D244D]">{stat.value}</p>
              <p className="text-sm text-[#8A94A6]">{stat.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});

ProfileStatsGrid.displayName = 'ProfileStatsGrid';
