
import { Target } from 'lucide-react';
import { FloatingBottomNav } from '@/components/FloatingBottomNav';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { NotificationBell } from '@/components/NotificationBell';
import { ComprehensiveActivityView } from '@/components/ComprehensiveActivityView';
import { CalorieTracker } from '@/components/CalorieTracker';
import { useApp } from '@/contexts/AppContext';
import { useUserStats } from '@/contexts/UserStatsContext';

const Activity = () => {
  const { userProfile } = useApp();
  const { stats } = useUserStats();
  
  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-32">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-xl sticky top-0 z-30 border-b border-gray-100/50">
        <div className="px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#1D244D] mb-1">
                Activity Tracking 🎯
              </h1>
              <p className="text-[#8A94A6] text-sm">Monitor your daily progress and health stats</p>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 space-y-8">
        {/* Comprehensive Activity View */}
        <ComprehensiveActivityView userStats={stats || { today_steps: 0 }} />

        {/* Calorie Tracker - Only if health data available */}
        {(userProfile.height && userProfile.weight && userProfile.age && userProfile.sex) && (
          <CalorieTracker />
        )}
      </div>

      <FloatingBottomNav />
    </div>
  );
};

export default Activity;
