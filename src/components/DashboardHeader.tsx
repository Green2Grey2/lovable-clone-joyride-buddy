import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { ProfileDropdown } from './ProfileDropdown';
import { NotificationBell } from './NotificationBell';
import { GlobalSearch } from './GlobalSearch';

interface DashboardHeaderProps {
  userName: string;
  currentStreak: number;
  weeklyGoal: number;
  currentSteps: number;
}

export const DashboardHeader = ({ userName, currentStreak, weeklyGoal, currentSteps }: DashboardHeaderProps) => {
  return (
    <div className="glass dark:glass-dark backdrop-blur-xl sticky top-0 z-30 border-b border-border/50">
      <div className="px-6 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              Welcome back, {userName}! 👋
            </h1>
            <p className="text-muted-foreground text-sm">
              Ready to crush your fitness goals today?
            </p>
            
            <div className="flex items-center space-x-3 mt-3">
              <div className="glass-subtle rounded-lg px-3 py-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Current Streak</span>
                  <span className="text-sm font-bold text-foreground">{currentStreak} days 🔥</span>
                </div>
              </div>
              
              <div className="glass-subtle rounded-lg px-3 py-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Weekly Progress</span>
                  <span className="text-sm font-bold text-foreground">
                    {currentSteps?.toLocaleString() || 0} / {weeklyGoal?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <GlobalSearch />
            <NotificationBell />
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </div>
  );
};

DashboardHeader.displayName = 'DashboardHeader';
