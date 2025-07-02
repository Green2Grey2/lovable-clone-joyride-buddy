
import { ExpandedAchievementSystem } from '@/components/ExpandedAchievementSystem';
import { FloatingBottomNav } from '@/components/FloatingBottomNav';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { NotificationBell } from '@/components/NotificationBell';
import { useApp } from '@/contexts/AppContext';
import { Trophy } from 'lucide-react';

const Awards = () => {
  const { userProfile } = useApp();
  const firstName = userProfile.name.split(' ')[0];

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="glass dark:glass-dark backdrop-blur-xl sticky top-0 z-30 border-b border-border/50">
        <div className="px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">
                Awards & Achievements 🏆
              </h1>
              <p className="text-muted-foreground text-sm">
                Great work, {firstName}! Track your progress and unlock new achievements
              </p>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8">
        <ExpandedAchievementSystem />
      </div>

      <FloatingBottomNav />
    </div>
  );
};

export default Awards;
