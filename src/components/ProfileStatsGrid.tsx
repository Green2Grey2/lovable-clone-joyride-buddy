
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
      gradient: 'from-primary to-primary/60'
    },
    {
      icon: Calendar,
      value: userStats.totalWorkouts,
      label: 'Workouts',
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      icon: Flame,
      value: userStats.currentStreak,
      label: 'Day Streak',
      gradient: 'from-orange-500 to-yellow-500'
    },
    {
      icon: Award,
      value: userStats.longestStreak,
      label: 'Best Streak',
      gradient: 'from-yellow-500 to-orange-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="bg-card border-0 rounded-3xl shadow-sm">
            <CardContent className="p-6 text-center">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                <IconComponent className="h-6 w-6 text-primary-foreground" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});

ProfileStatsGrid.displayName = 'ProfileStatsGrid';
