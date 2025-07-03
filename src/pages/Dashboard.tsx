import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Activity, BookOpen, Award, Settings, User, Trophy } from 'lucide-react';
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

import { TestFlagActivity } from '@/components/TestFlagActivity';
import { ManualStepTracker } from '@/components/ManualStepTracker';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
      <div className="min-h-screen bg-background pb-20 lg:pb-0">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-card border-r border-border/50 z-40">
          <div className="flex flex-col h-full">
            {/* Logo/Brand Section */}
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">🏃‍♂️ Joyride Buddy</h2>
              <p className="text-sm text-muted-foreground mt-1">Wellness Platform</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              <button
                onClick={() => {
                  playNavigation();
                  navigate('/dashboard');
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-smooth ${
                  location.pathname === '/dashboard'
                    ? 'bg-primary text-primary-foreground shadow-primary'
                    : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground'
                }`}
              >
                <Home className="h-5 w-5" />
                <span className="font-medium">Dashboard</span>
              </button>

              <button
                onClick={() => {
                  playNavigation();
                  navigate('/activity');
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  location.pathname === '/activity'
                    ? 'gradient-primary text-inverse shadow-brand'
                    : 'text-secondary hover:bg-muted hover:text-primary'
                }`}
              >
                <Activity className="h-5 w-5" />
                <span className="font-medium">Activity</span>
              </button>

              <button
                onClick={() => {
                  playNavigation();
                  navigate('/media');
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  location.pathname === '/media'
                    ? 'gradient-primary text-inverse shadow-brand'
                    : 'text-secondary hover:bg-muted hover:text-primary'
                }`}
              >
                <BookOpen className="h-5 w-5" />
                <span className="font-medium">Media</span>
              </button>

              <button
                onClick={() => {
                  playNavigation();
                  navigate('/awards');
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  location.pathname === '/awards'
                    ? 'gradient-primary text-inverse shadow-brand'
                    : 'text-secondary hover:bg-muted hover:text-primary'
                }`}
              >
                <Award className="h-5 w-5" />
                <span className="font-medium">Awards</span>
              </button>

              {/* Admin/Manager Links */}
              {(isManager() || isAdmin()) && (
                <div className="pt-4 mt-4 border-t border-border">
                  <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2 px-4">
                    Management
                  </p>
                  <button
                    onClick={() => {
                      playNavigation();
                      navigate(isAdmin() ? '/admin' : '/manager');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-smooth text-muted-foreground hover:bg-accent/10 hover:text-foreground"
                  >
                    <Settings className="h-5 w-5" />
                    <span className="font-medium">
                      {isAdmin() ? 'Admin Panel' : 'Manager Tools'}
                    </span>
                  </button>
                </div>
              )}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <div className="w-8 h-8 gradient-health rounded-full flex items-center justify-center shadow-primary">
                  <span className="text-sm font-bold text-primary-foreground">
                    {userProfile.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {userProfile.name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {userStats.currentStreak} day streak 🔥
                  </p>
                </div>
              </div>
            </div>
      </div>
        </aside>

        {/* Main Content - Offset for sidebar on desktop */}
        <div className="lg:ml-64">
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
                  
                  {/* Manual Step Tracker */}
                  <ManualStepTracker 
                    currentSteps={userStats.todaySteps}
                    onStepsAdded={() => {
                      // Trigger a refresh of the app context data
                      window.location.reload();
                    }}
                  />
                  
                  {/* Quick Actions for desktop */}
                  <div className="hidden lg:block">
                    <div className="card-modern glass dark:glass-dark p-6">
                      <h3 className="text-lg font-semibold mb-4 text-foreground">Quick Actions</h3>
                      <div className="space-y-3">
                        <button 
                          className="w-full text-left px-4 py-3 rounded-xl hover:bg-accent/10 transition-smooth text-muted-foreground hover:text-foreground btn-modern"
                          onClick={() => navigate('/profile')}
                        >
                          <User className="h-4 w-4 inline mr-3" />
                          View Profile
                        </button>
                        <button 
                          className="w-full text-left px-4 py-3 rounded-xl hover:bg-accent/10 transition-smooth text-muted-foreground hover:text-foreground btn-modern"
                          onClick={() => navigate('/awards')}
                        >
                          <Trophy className="h-4 w-4 inline mr-3" />
                          Check Awards
                        </button>
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
        </div>

        {/* Mobile Navigation - Hidden on desktop */}
        <div className="lg:hidden">
          <FloatingActivityFeed />
          <FloatingBottomNav />
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
