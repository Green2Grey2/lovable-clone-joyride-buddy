
import React, { useState } from 'react';
import { ProfileHeader } from '@/components/ProfileHeader';
import { ProfileStatsGrid } from '@/components/ProfileStatsGrid';
import { FloatingBottomNav } from '@/components/FloatingBottomNav';
import { UserQRCode } from '@/components/UserQRCode';
import { HealthSyncButton } from '@/components/HealthSyncButton';
import { NotificationSettings } from '@/components/NotificationSettings';
import { FeedbackButton } from '@/components/FeedbackButton';

const Profile = () => {
  
  const [showGoalsEditor, setShowGoalsEditor] = useState(false);

  // Mock user stats - in a real app, this would come from a context or API
  const userStats = {
    totalSteps: 45678,
    totalWorkouts: 23,
    currentStreak: 7,
    longestStreak: 14
  };

  const handleGoalsEditorOpen = () => {
    setShowGoalsEditor(true);
  };

  try {
    return (
      <div className="min-h-screen bg-background pb-32">
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <ProfileHeader onGoalsEditorOpen={handleGoalsEditorOpen} />
            </div>
            <div className="ml-4">
              <FeedbackButton />
            </div>
          </div>
          
          {/* Health Sync Section */}
          <div className="card-modern glass dark:glass-dark p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Health Data Sync</h3>
            <HealthSyncButton />
          </div>

          {/* Notification Settings */}
          <NotificationSettings />
          
          <ProfileStatsGrid userStats={userStats} />
          <UserQRCode />
        </div>
        <FloatingBottomNav />
      </div>
    );
  } catch (error) {
    console.error('Error rendering Profile page:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Profile</h1>
          <p className="text-gray-600">Please check the console for details</p>
        </div>
      </div>
    );
  }
};

export default Profile;
