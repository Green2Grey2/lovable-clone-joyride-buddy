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
    <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6 rounded-lg mb-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-primary-foreground/80 mb-4">
            Ready to crush your fitness goals today?
          </p>
          
          <div className="flex items-center space-x-4">
            <div className="bg-background/20 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Current Streak</span>
                <span className="text-lg font-bold">{currentStreak} days 🔥</span>
              </div>
            </div>
            
            <div className="bg-background/20 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Weekly Progress</span>
                <span className="text-lg font-bold">
                  {currentSteps?.toLocaleString() || 0} / {weeklyGoal?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <GlobalSearch />
          <NotificationBell />
          <ProfileDropdown />
        </div>
      </div>
    </div>
  );
};

DashboardHeader.displayName = 'DashboardHeader';
