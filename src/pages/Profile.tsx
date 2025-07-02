
import React, { useState } from 'react';
import { ProfileHeader } from '@/components/ProfileHeader';
import { ProfileStatsGrid } from '@/components/ProfileStatsGrid';
import { FloatingBottomNav } from '@/components/FloatingBottomNav';
import { UserQRCode } from '@/components/UserQRCode';
import { HealthSyncButton } from '@/components/HealthSyncButton';

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
      <div className="min-h-screen bg-gray-50 pb-32">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          <ProfileHeader onGoalsEditorOpen={handleGoalsEditorOpen} />
          
          {/* Health Sync Section */}
          <div className="bg-white rounded-3xl p-6 shadow-[0px_10px_30px_rgba(115,92,247,0.1)]">
            <h3 className="text-lg font-semibold text-[#1D244D] mb-4">Health Data Sync</h3>
            <HealthSyncButton />
          </div>
          
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
