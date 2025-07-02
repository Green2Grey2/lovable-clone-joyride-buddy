import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActivityFeed } from '@/components/ActivityFeed';
import { CollaborativeGoals } from '@/components/CollaborativeGoals';
import { ModernHealthSummary } from '@/components/ModernHealthSummary';
import { AppleNewsVideoLibrary } from '@/components/AppleNewsVideoLibrary';
import { FloatingBottomNav } from '@/components/FloatingBottomNav';
import { WalkingChallengeCountdown } from '@/components/WalkingChallengeCountdown';
import { ActiveChallengeWidget } from '@/components/ActiveChallengeWidget';
import { DashboardHeader } from '@/components/DashboardHeader';
import { EnhancedHeroActionCard } from '@/components/EnhancedHeroActionCard';
import { ActivitySelector } from '@/components/ActivitySelector';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { FloatingActivityFeed } from '@/components/FloatingActivityFeed';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveStack } from '@/components/layout/ResponsiveContainer';
import { useApp } from '@/contexts/AppContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useChallengeSettings } from '@/hooks/useChallengeSettings';
import { useUserRole } from '@/hooks/useUserRole';

const Dashboard = () => {
  const navigate = useNavigate();
  const { userProfile, userStats, activeActivity, getDashboardGreeting } = useApp();
  const { playSoftClick, playNavigation, playStartActivity } = useSoundEffects();
  const { challengeSettings } = useChallengeSettings();
  const { role, isAdmin, isManager } = useUserRole();
  const [showActivitySelector, setShowActivitySelector] = useState(false);

  const challengeStartDate = new Date(challengeSettings.startDate + 'T00:00:00');
  const challengeEndDate = new Date(challengeSettings.endDate + 'T23:59:59');
  const now = new Date();
  const challengeHasStarted = now >= challengeStartDate && now <= challengeEndDate;
  const userIsRegistered = true;

  const handleNotifications = () => {
    playSoftClick();
    console.log('Notifications clicked');
  };

  const handlePrimaryAction = () => {
    if (activeActivity) {
      playNavigation();
      navigate('/active-activity');
    } else {
      playStartActivity();
      setShowActivitySelector(true);
    }
  };

  const handleViewMoreActivity = () => {
    playNavigation();
    navigate('/activity');
  };

  const stepGoal = Math.floor(userProfile.weeklyGoal / 7);
  const greetingMessage = getDashboardGreeting();

  // Customize greeting based on role
  const getRoleBasedGreeting = () => {
    const baseGreeting = greetingMessage.message;
    if (isAdmin()) {
      return `${baseGreeting} (Admin)`;
    } else if (isManager()) {
      return `${baseGreeting} (Manager)`;
    }
    return baseGreeting;
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#F9F9F9] pb-20 md:pb-0">
        <DashboardHeader
          userName={userProfile.name || 'User'}
          currentStreak={userStats.currentStreak || 0}
          weeklyGoal={userProfile.weeklyGoal || 10000}
          currentSteps={userStats.todaySteps || 0}
        />

        <ResponsiveContainer maxWidth="2xl" padding="md" className="py-8">
          <ResponsiveStack spacing="lg">
            {/* Challenge Section - Full width on all screens */}
            <div className="w-full">
              {challengeHasStarted && userIsRegistered ? (
                <ActiveChallengeWidget />
              ) : (
                <WalkingChallengeCountdown />
              )}
            </div>

            {/* Main Content Area - Responsive Grid */}
            <ResponsiveGrid 
              cols={{ 
                default: 1, 
                lg: 3 
              }} 
              gap="lg"
              className="items-start"
            >
              {/* Primary Content - Takes 2 columns on large screens */}
              <div className="lg:col-span-2 space-y-8">
                {/* Hero Action Card */}
                <EnhancedHeroActionCard
                  activeActivity={activeActivity}
                  onPrimaryAction={handlePrimaryAction}
                  todaySteps={userStats.todaySteps}
                  stepGoal={stepGoal}
                />

                {/* Health Summary - Responsive Grid within */}
                <ModernHealthSummary 
                  steps={userStats.todaySteps}
                  stepGoal={stepGoal}
                  water={userStats.water}
                  heartRate={userStats.heartRate}
                  calories={userStats.calories}
                  onViewMore={handleViewMoreActivity}
                />

                {/* Collaborative Goals */}
                <CollaborativeGoals />

                {/* Video Library - Hidden on mobile, shown on tablet+ */}
                <div className="hidden md:block">
                  <AppleNewsVideoLibrary />
                </div>
              </div>

              {/* Sidebar Content - 1 column on large screens */}
              <div className="space-y-6">
                {/* Social Feed - Static on desktop */}
                <div className="hidden lg:block">
                  <ActivityFeed />
                </div>
                
                {/* Quick Actions for desktop */}
                <div className="hidden lg:block">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button 
                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={() => navigate('/profile')}
                      >
                        View Profile
                      </button>
                      <button 
                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={() => navigate('/awards')}
                      >
                        Check Awards
                      </button>
                      {(isManager() || isAdmin()) && (
                        <button 
                          className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                          onClick={() => navigate(isAdmin() ? '/admin' : '/manager')}
                        >
                          {isAdmin() ? 'Admin Dashboard' : 'Manager Dashboard'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </ResponsiveGrid>

            {/* Mobile-only Video Library */}
            <div className="md:hidden">
              <AppleNewsVideoLibrary />
            </div>
          </ResponsiveStack>
        </ResponsiveContainer>

        {/* Mobile Navigation - Hidden on desktop */}
        <div className="lg:hidden">
          <FloatingActivityFeed />
          <FloatingBottomNav />
        </div>

        {/* Desktop Navigation - Fixed sidebar */}
        <div className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-6">
          <nav className="space-y-4 mt-20">
            <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary">
              <span>Dashboard</span>
            </a>
            <a href="/activity" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50">
              <span>Activity</span>
            </a>
            <a href="/media" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50">
              <span>Media</span>
            </a>
            <a href="/awards" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50">
              <span>Awards</span>
            </a>
          </nav>
        </div>

        {/* Activity Selector Modal */}
        <ActivitySelector 
          isOpen={showActivitySelector}
          onClose={() => setShowActivitySelector(false)}
        />
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;
