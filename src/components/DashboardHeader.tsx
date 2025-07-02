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
    <div className="glass dark:glass-dark backdrop-blur-xl border-b border-border/50 p-4 mb-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <h1 className="text-xl font-bold mb-1 text-foreground">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-muted-foreground text-sm mb-3">
            Ready to crush your fitness goals today?
          </p>
          
          <div className="flex items-center space-x-3">
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
        
        <div className="flex items-center space-x-2 animate-fade-in">
          <GlobalSearch />
          <NotificationBell />
          <ProfileDropdown />
        </div>
      </div>
    </div>
  );
};

DashboardHeader.displayName = 'DashboardHeader';
