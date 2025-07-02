import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Activity, Award, Plus, ArrowLeft, BookOpen } from 'lucide-react';
import { ActivitySelector } from '@/components/ActivitySelector';
import { useSwipe, useHapticFeedback } from '@/hooks/useGestures';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useNavigation } from '@/contexts/NavigationContext';
import { cn } from '@/lib/utils';

export const FloatingBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showActivitySelector, setShowActivitySelector] = useState(false);
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const { preferences } = useUserPreferences();
  const { lightTap, mediumTap } = useHapticFeedback();
  const { isBottomNavVisible, setIsBottomNavVisible } = useNavigation();

  const isActive = (path: string) => location.pathname === path;
  
  // Determine if we should show back button
  const shouldShowBack = () => {
    const parentPages = ['/', '/dashboard', '/activity', '/awards', '/media'];
    return !parentPages.includes(location.pathname);
  };

  const getParentPage = () => {
    if (location.pathname.includes('/admin')) return '/dashboard';
    if (location.pathname.includes('/manager')) return '/dashboard';
    if (location.pathname.includes('/active-activity')) return '/activity';
    return '/dashboard';
  };

  const handleBack = () => {
    navigate(getParentPage());
  };

  const handlePlusClick = () => {
    if (preferences.hapticEnabled) {
      mediumTap();
    }
    setShowActivitySelector(true);
  };

  // Build core navigation items (4 items for optimal layout)
  const navItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: Activity, label: 'Analytics', path: '/analytics' },
    { icon: BookOpen, label: 'Media', path: '/media' },
    { icon: Award, label: 'Awards', path: '/awards' },
  ];

  // Navigation visibility is now managed by NavigationContext

  // Swipe gesture support
  const swipeRef = useSwipe({
    threshold: 80,
    onSwipeLeft: () => {
      const nextIndex = (currentTabIndex + 1) % navItems.length;
      setCurrentTabIndex(nextIndex);
      navigate(navItems[nextIndex].path);
      if (preferences.hapticEnabled) lightTap();
    },
    onSwipeRight: () => {
      const prevIndex = currentTabIndex === 0 ? navItems.length - 1 : currentTabIndex - 1;
      setCurrentTabIndex(prevIndex);
      navigate(navItems[prevIndex].path);
      if (preferences.hapticEnabled) lightTap();
    },
    onSwipeUp: () => {
      setIsBottomNavVisible(true);
    },
    onSwipeDown: () => {
      setIsBottomNavVisible(false);
    },
  });

  // Update current tab index based on location
  useEffect(() => {
    const activeIndex = navItems.findIndex(item => item.path === location.pathname);
    if (activeIndex !== -1) {
      setCurrentTabIndex(activeIndex);
    }
  }, [location.pathname]);

  // Handle navigation with haptic feedback
  const handleNavigation = (path: string, index: number) => {
    if (preferences.hapticEnabled) {
      lightTap();
    }
    setCurrentTabIndex(index);
    navigate(path);
  };

  // Fixed 5-column layout (2 items + plus button + 2 items)
  const gridCols = 'grid-cols-5';

  return (
    <>
      {/* Back Button - Top left of screen */}
      {shouldShowBack() && (
        <div className="fixed top-6 left-4 z-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2 h-10 px-4 glass dark:glass-dark text-muted-foreground hover:text-primary rounded-full shadow-medium hover:shadow-strong transition-smooth"
          >
            <ArrowLeft className="h-4 w-4" />
            
          </Button>
        </div>
      )}

      <div 
        ref={swipeRef as React.RefObject<HTMLDivElement>}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 pb-safe transition-transform duration-300 ease-in-out",
          isBottomNavVisible ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="glass dark:glass-dark mx-4 mb-4 rounded-2xl shadow-premium">
          <div className="relative">
            {/* Swipe indicator */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-muted-foreground/30 rounded-full" />

            {/* Navigation Grid */}
            <div className={`grid ${gridCols} gap-1 px-4 py-3 pt-5`}>
              {/* First half of nav items */}
              {navItems.slice(0, 2).map((item, index) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation(item.path, index)}
                  className={cn(
                    "flex flex-col items-center gap-1 h-auto py-2 px-2 transition-smooth touch-manipulation relative overflow-hidden",
                    isActive(item.path)
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  aria-label={`Navigate to ${item.label}`}
                  aria-current={isActive(item.path) ? 'page' : undefined}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-smooth",
                    isActive(item.path) && "drop-shadow-[0_0_8px_rgba(34,191,253,0.5)]"
                  )} />
                  <span className="text-xs font-medium">{item.label}</span>
                  {isActive(item.path) && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-full" />
                  )}
                </Button>
              ))}

              {/* Centered Plus Button */}
              <div className="flex justify-center items-center">
                <Button
                  onClick={handlePlusClick}
                  className="h-12 w-12 rounded-full gradient-health text-neutral-950 shadow-primary hover:shadow-xl transition-smooth hover:scale-105 active:scale-95 touch-manipulation glow-primary"
                  size="icon"
                  aria-label="Start new activity"
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </div>

              {/* Second half of nav items */}
              {navItems.slice(2).map((item, index) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation(item.path, index + 2)}
                  className={cn(
                    "flex flex-col items-center gap-1 h-auto py-2 px-2 transition-smooth touch-manipulation relative overflow-hidden",
                    isActive(item.path)
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  aria-label={`Navigate to ${item.label}`}
                  aria-current={isActive(item.path) ? 'page' : undefined}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-smooth",
                    isActive(item.path) && "drop-shadow-[0_0_8px_rgba(34,191,253,0.5)]"
                  )} />
                  <span className="text-xs font-medium">{item.label}</span>
                  {isActive(item.path) && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-full" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Selector Dialog */}
      <ActivitySelector 
        isOpen={showActivitySelector}
        onClose={() => setShowActivitySelector(false)}
      />
    </>
  );
};