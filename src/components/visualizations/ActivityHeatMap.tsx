import React, { useMemo, useRef, useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, subMonths, startOfYear, eachMonthOfInterval, isSameDay, startOfWeek, endOfWeek, subDays, addDays } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { activityTrackingService } from '@/utils/activityTrackingService';

import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Info, Activity, Clock, Flame, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSwipe, useHapticFeedback } from '@/hooks/useGestures';

interface ActivityData {
  date: string;
  intensity: number; // 0-4 scale
  steps?: number;
  calories?: number;
  minutes?: number;
}

export const ActivityHeatMap: React.FC = () => {
  const { user } = useAuth();
  const { playSoftClick } = useSoundEffects();
  const isMobile = useIsMobile();
  const { lightTap, mediumTap } = useHapticFeedback();
  
  const [activityData, setActivityData] = useState<Record<string, ActivityData>>({});
  const [loading, setLoading] = useState(true);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showTip, setShowTip] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0); // For compact week navigation
  const [dataCache, setDataCache] = useState<Map<string, Record<string, ActivityData>>>(new Map());
  const [preloadedWeeks, setPreloadedWeeks] = useState<Set<number>>(new Set());
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user) {
      if (isExpanded) {
        loadActivityData();
      } else {
        loadWeekData();
      }
    }
  }, [user, currentDate, viewMode, weekOffset, isExpanded]);

  // Load data for expanded month/year view
  const loadActivityData = async () => {
    try {
      setLoading(true);
      const startDate = viewMode === 'month' 
        ? startOfMonth(currentDate)
        : startOfYear(currentDate);
      
      const endDate = viewMode === 'month'
        ? endOfMonth(currentDate)
        : new Date();

      const cacheKey = `${viewMode}-${format(startDate, 'yyyy-MM-dd')}-${format(endDate, 'yyyy-MM-dd')}`;
      
      // Check cache first
      if (dataCache.has(cacheKey)) {
        setActivityData(dataCache.get(cacheKey)!);
        setLoading(false);
        return;
      }

      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const activities = await activityTrackingService.getActivityHistory(user?.id!, days);

      const processed: Record<string, ActivityData> = {};
      activities?.forEach(activity => {
        if (activity.date >= format(startDate, 'yyyy-MM-dd') && 
            activity.date <= format(endDate, 'yyyy-MM-dd')) {
          const intensity = calculateIntensity(activity.duration || 0, activity.calories_burned || 0);
          processed[activity.date] = {
            date: activity.date,
            intensity,
            minutes: activity.duration || 0,
            calories: activity.calories_burned || 0,
            steps: activity.steps || 0
          };
        }
      });

      // Cache the data
      setDataCache(prev => new Map(prev).set(cacheKey, processed));
      setActivityData(processed);
    } catch (error) {
      console.error('Error loading activity data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data for compact week view with preloading
  const loadWeekData = async (targetWeekOffset = weekOffset, isPreload = false) => {
    try {
      if (!isPreload) setLoading(true);
      
      const today = new Date();
      const baseDate = subDays(today, targetWeekOffset);
      const weekStart = subDays(baseDate, 6);
      const weekEnd = baseDate;
      
      const cacheKey = `week-${targetWeekOffset}`;
      
      // Check cache first
      if (dataCache.has(cacheKey)) {
        if (!isPreload) {
          setActivityData(dataCache.get(cacheKey)!);
        }
        if (!isPreload) setLoading(false);
        return;
      }

      const days = 7;
      const activities = await activityTrackingService.getActivityHistory(user?.id!, Math.abs(targetWeekOffset) + 14);

      const processed: Record<string, ActivityData> = {};
      activities?.forEach(activity => {
        if (activity.date >= format(weekStart, 'yyyy-MM-dd') && 
            activity.date <= format(weekEnd, 'yyyy-MM-dd')) {
          const intensity = calculateIntensity(activity.duration || 0, activity.calories_burned || 0);
          processed[activity.date] = {
            date: activity.date,
            intensity,
            minutes: activity.duration || 0,
            calories: activity.calories_burned || 0,
            steps: activity.steps || 0
          };
        }
      });

      // Cache the data
      setDataCache(prev => new Map(prev).set(cacheKey, processed));
      setPreloadedWeeks(prev => new Set(prev).add(targetWeekOffset));
      
      if (!isPreload) {
        setActivityData(processed);
      }
    } catch (error) {
      console.error('Error loading week data:', error);
    } finally {
      if (!isPreload) setLoading(false);
    }
  };

  // Preload adjacent weeks for smooth navigation
  const preloadAdjacentWeeks = useCallback(async (currentOffset: number) => {
    const weeksToPrefetch = [-1, 1].map(delta => currentOffset + (delta * 7));
    
    for (const weekOffset of weeksToPrefetch) {
      if (!preloadedWeeks.has(weekOffset) && weekOffset >= 0) {
        setBackgroundLoading(true);
        await loadWeekData(weekOffset, true);
        setBackgroundLoading(false);
      }
    }
  }, [preloadedWeeks]);

  // Initial preloading effect
  useEffect(() => {
    if (user && !isExpanded && weekOffset >= 0) {
      preloadAdjacentWeeks(weekOffset);
    }
  }, [user, weekOffset, isExpanded, preloadAdjacentWeeks]);

  const calculateIntensity = (duration: number, calories: number): number => {
    const score = (duration / 30) + (calories / 300);
    if (score >= 2) return 4;
    if (score >= 1.5) return 3;
    if (score >= 1) return 2;
    if (score > 0) return 1;
    return 0;
  };

  const getActivityColor = (intensity: number) => {
    const colors = [
      'bg-muted/20 dark:bg-muted/10',                    // 0 - No activity
      'bg-primary/20 dark:bg-primary/25 shadow-sm',     // 1 - Light
      'bg-primary/40 dark:bg-primary/45 shadow-sm',     // 2 - Moderate
      'bg-primary/60 dark:bg-primary/65 shadow-md',     // 3 - Good
      'bg-primary/80 dark:bg-primary/90 shadow-lg shadow-primary/30', // 4 - Excellent
    ];
    return colors[Math.min(intensity, 4)];
  };

  const getActivityPattern = (intensity: number) => {
    // Add visual patterns for different intensities
    const patterns = [
      '', // 0 - No pattern
      'bg-gradient-to-br from-transparent via-primary/10 to-transparent', // 1 - Subtle gradient
      'bg-gradient-to-tr from-primary/20 via-transparent to-primary/20', // 2 - Diagonal gradient
      'bg-gradient-to-r from-primary/30 via-primary/50 to-primary/30', // 3 - Horizontal gradient
      'bg-gradient-to-br from-primary/60 via-primary/90 to-primary/60', // 4 - Strong radial-like
    ];
    return patterns[Math.min(intensity, 4)];
  };

  // Mobile-first interaction handler
  const handleDayInteraction = useCallback((dateStr: string, activity: ActivityData | undefined) => {
    if (!activity) return;
    
    setSelectedDay(dateStr);
    
    if (isMobile) {
      // Mobile: Single tap shows modal directly
      lightTap();
      setShowDetailModal(true);
    } else {
      // Desktop: Double-click for modal
      setShowDetailModal(true);
    }
  }, [isMobile, lightTap]);

  // Navigation handlers with debouncing
  const navigatePrevious = useCallback(() => {
    playSoftClick();
    mediumTap();
    
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    if (isExpanded) {
      // Month navigation when expanded
      setCurrentDate(prev => subMonths(prev, 1));
    } else {
      // Week navigation when compact - debounce rapid navigation
      setWeekOffset(prev => prev + 7);
      
      // Debounce preloading to avoid excessive API calls
      debounceTimer.current = setTimeout(() => {
        preloadAdjacentWeeks(weekOffset + 7);
      }, 300);
    }
  }, [isExpanded, playSoftClick, mediumTap, weekOffset, preloadAdjacentWeeks]);

  const navigateNext = useCallback(() => {
    playSoftClick();
    mediumTap();
    
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    if (isExpanded) {
      // Month navigation when expanded
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      if (nextMonth <= new Date()) {
        setCurrentDate(nextMonth);
      }
    } else {
      // Week navigation when compact - debounce rapid navigation
      if (weekOffset > 0) {
        setWeekOffset(prev => prev - 7);
        
        // Debounce preloading to avoid excessive API calls
        debounceTimer.current = setTimeout(() => {
          preloadAdjacentWeeks(weekOffset - 7);
        }, 300);
      }
    }
  }, [isExpanded, currentDate, weekOffset, playSoftClick, mediumTap, preloadAdjacentWeeks]);

  const handleToggleExpand = () => {
    playSoftClick();
    
    if (isExpanded) {
      // Switching from expanded to collapsed - calculate weekOffset from currentDate
      const today = new Date();
      const diffTime = today.getTime() - currentDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const newWeekOffset = Math.max(0, Math.floor(diffDays / 7) * 7);
      setWeekOffset(newWeekOffset);
    } else {
      // Switching from collapsed to expanded - set currentDate from weekOffset
      const today = new Date();
      const targetDate = subDays(today, weekOffset);
      const monthOfTargetWeek = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      setCurrentDate(monthOfTargetWeek);
    }
    
    setIsExpanded(!isExpanded);
  };

  const handleGoToToday = () => {
    playSoftClick();
    mediumTap();
    setWeekOffset(0);
    setCurrentDate(new Date());
  };

  const getWeekData = () => {
    const today = new Date();
    const baseDate = subDays(today, weekOffset);
    const weekDays = Array.from({ length: 7 }, (_, i) => subDays(baseDate, 6 - i));
    return weekDays.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      return {
        date: day,
        dateStr,
        activity: activityData[dateStr],
        isToday: isSameDay(day, today)
      };
    });
  };

  const getCompactStats = () => {
    const weekData = getWeekData();
    const activeDays = weekData.filter(d => d.activity && d.activity.intensity > 0).length;
    const todayActivity = activityData[format(new Date(), 'yyyy-MM-dd')];
    
    return {
      activeDays,
      todayMinutes: todayActivity?.minutes || 0,
      todayCalories: todayActivity?.calories || 0
    };
  };

  // Swipe handlers for compact view
  const compactSwipeRef = useSwipe({
    onSwipeLeft: navigateNext,
    onSwipeRight: navigatePrevious,
    threshold: 50,
    velocityThreshold: 0.3,
  });

  // Swipe handlers for expanded view
  const expandedSwipeRef = useSwipe({
    onSwipeLeft: navigateNext,
    onSwipeRight: navigatePrevious,
    threshold: 50,
    velocityThreshold: 0.3,
  });

  const renderCompactWeekView = () => {
    const weekData = getWeekData();
    const stats = getCompactStats();
    
    return (
      <div 
        ref={compactSwipeRef as React.RefObject<HTMLDivElement>}
        className="space-y-4 select-none"
      >
        {/* Navigation Header with Week Info and Today Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={navigatePrevious}
            className="p-2 rounded-full glass dark:glass-dark hover:bg-primary/10 transition-all duration-200 active:scale-95"
            aria-label="Previous week"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <div className="flex flex-col items-center gap-1">
            <div className="text-sm font-medium text-foreground">
              {format(getWeekData()[0].date, 'MMM d')} - {format(getWeekData()[6].date, 'MMM d')}
            </div>
            <div className="text-xs text-muted-foreground">
              {weekOffset === 0 ? 'This Week' : `${Math.ceil(weekOffset / 7)} week${weekOffset > 7 ? 's' : ''} ago`}
            </div>
            {/* Today button integrated into navigation */}
            {weekOffset > 0 && (
              <button
                onClick={handleGoToToday}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors mt-1"
              >
                <Calendar className="h-3 w-3" />
                <span>Today</span>
              </button>
            )}
          </div>
          
          <button
            onClick={navigateNext}
            disabled={weekOffset === 0}
            className={cn(
              "p-2 rounded-full glass dark:glass-dark transition-all duration-200 active:scale-95",
              weekOffset === 0 
                ? "opacity-50 cursor-not-allowed" 
                : "hover:bg-primary/10"
            )}
            aria-label="Next week"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Mini Stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 glass dark:glass-dark rounded-xl hover-scale">
            <div className="text-lg font-bold text-primary">{stats.activeDays}</div>
            <div className="text-xs text-muted-foreground">Active Days</div>
          </div>
          <div className="p-3 glass dark:glass-dark rounded-xl hover-scale">
            <div className="text-lg font-bold text-foreground">{stats.todayMinutes}</div>
            <div className="text-xs text-muted-foreground">Today (min)</div>
          </div>
          <div className="p-3 glass dark:glass-dark rounded-xl hover-scale">
            <div className="text-lg font-bold text-orange-500">{stats.todayCalories}</div>
            <div className="text-xs text-muted-foreground">Calories</div>
          </div>
        </div>

        {/* Week Row with Enhanced Mobile Interactions */}
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground text-center">
            Swipe left/right to navigate • Tap for details
          </div>
          <div className="grid grid-cols-7 gap-2">
            {weekData.map((day, index) => {
              const intensity = day.activity?.intensity || 0;
              const hasActivity = day.activity && intensity > 0;
              
              return (
                <div
                  key={index}
                  className={cn(
                    "aspect-square rounded-xl transition-all duration-300 relative group",
                    "active:scale-95 select-none",
                    hasActivity ? "cursor-pointer hover:scale-105" : "cursor-default",
                    getActivityColor(intensity),
                    day.isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg",
                    getActivityPattern(intensity)
                  )}
                  onClick={() => hasActivity && handleDayInteraction(day.dateStr, day.activity)}
                >
                  {/* Day Letter */}
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-foreground/80">
                    {format(day.date, 'EEEEE')}
                  </span>
                  
                  {/* Activity indicator */}
                  {hasActivity && (
                    <div className="absolute top-1 right-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    </div>
                  )}
                  
                  {/* Mobile-optimized tooltip */}
                  {day.activity && !isMobile && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 pointer-events-none">
                      <div className="glass dark:glass-dark p-2 rounded-lg shadow-xl text-xs whitespace-nowrap">
                        <div className="font-semibold text-primary text-center">
                          {format(day.date, 'MMM d')}
                        </div>
                        <div className="text-center text-muted-foreground">
                          {day.activity.minutes}m • {day.activity.calories}cal
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const firstDayOfWeek = monthStart.getDay();
    const prevMonthEnd = endOfMonth(subMonths(currentDate, 1));
    const prevMonthDays = Array.from({ length: firstDayOfWeek }, (_, i) => 
      new Date(prevMonthEnd.getFullYear(), prevMonthEnd.getMonth(), prevMonthEnd.getDate() - firstDayOfWeek + i + 1)
    );
    
    const allDays = [...prevMonthDays, ...days];
    const weeks = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }

    const weekDays = isMobile ? ['S', 'M', 'T', 'W', 'T', 'F', 'S'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div 
        ref={expandedSwipeRef as React.RefObject<HTMLDivElement>}
        className="select-none"
      >
        {/* Month Navigation Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={navigatePrevious}
            className="p-3 rounded-full glass dark:glass-dark hover:bg-primary/10 transition-all duration-200 active:scale-95"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="flex flex-col items-center gap-1">
            <h3 className="text-lg font-semibold text-foreground">
              {format(currentDate, 'MMMM yyyy')}
            </h3>
            <p className="text-xs text-muted-foreground">
              Swipe to navigate months • {isMobile ? 'Tap' : 'Double-click'} for details
            </p>
            {/* Today button for expanded view */}
            {!isSameMonth(currentDate, new Date()) && (
              <button
                onClick={handleGoToToday}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors mt-1"
              >
                <Calendar className="h-3 w-3" />
                <span>Today</span>
              </button>
            )}
          </div>
          
          <button
            onClick={navigateNext}
            disabled={isSameMonth(currentDate, new Date())}
            className={cn(
              "p-3 rounded-full glass dark:glass-dark transition-all duration-200 active:scale-95",
              isSameMonth(currentDate, new Date()) 
                ? "opacity-50 cursor-not-allowed" 
                : "hover:bg-primary/10"
            )}
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-3">
          {weekDays.map((day, i) => (
            <div key={i} className="text-xs text-muted-foreground text-center font-semibold py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid with enhanced mobile interactions */}
        <div className="space-y-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map((day, dayIndex) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const activity = activityData[dateStr];
                const intensity = activity?.intensity || 0;
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, new Date());
                const hasActivity = activity && intensity > 0;
                
                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={cn(
                      "aspect-square rounded-xl transition-all duration-300 relative group select-none",
                      "active:scale-95",
                      isCurrentMonth ? getActivityColor(intensity) : 'bg-muted/5',
                      hasActivity ? "cursor-pointer hover:scale-105" : "cursor-default",
                      isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg",
                      isCurrentMonth && getActivityPattern(intensity)
                    )}
                    onClick={() => hasActivity && handleDayInteraction(dateStr, activity)}
                  >
                    {/* Day number */}
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-foreground/80">
                      {isCurrentMonth && format(day, 'd')}
                    </span>
                    
                    {/* Activity indicator */}
                    {hasActivity && (
                      <div className="absolute top-1 right-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-sm" />
                      </div>
                    )}
                    
                    {/* Desktop tooltip only */}
                    {activity && !isMobile && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 pointer-events-none">
                        <div className="glass dark:glass-dark p-3 rounded-lg shadow-xl text-xs whitespace-nowrap min-w-[120px]">
                          <div className="font-semibold text-primary flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            {format(day, 'MMM d')}
                          </div>
                          <div className="space-y-1 mt-2">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">{activity.minutes} min</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Flame className="h-3 w-3 text-orange-500" />
                              <span className="text-orange-500">{activity.calories} cal</span>
                            </div>
                            {activity.steps && activity.steps > 0 && (
                              <div className="text-primary text-xs">
                                {activity.steps.toLocaleString()} steps
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-2 border-t border-border/30 pt-1">
                            {isMobile ? 'Tap for details' : 'Double-click for details'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    const yearStart = startOfYear(currentDate);
    const months = eachMonthOfInterval({ start: yearStart, end: new Date() });
    
    return (
      <div className="grid grid-cols-4 gap-4">
        {months.map(month => {
          const monthDays = eachDayOfInterval({
            start: startOfMonth(month),
            end: endOfMonth(month)
          });
          
          const monthActivity = monthDays.reduce((acc, day) => {
            const activity = activityData[format(day, 'yyyy-MM-dd')];
            return acc + (activity?.intensity || 0);
          }, 0);
          
          const avgIntensity = Math.round(monthActivity / monthDays.length);
          
          return (
            <div
              key={month.toISOString()}
              className={cn(
                "p-4 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer",
                getActivityColor(avgIntensity)
              )}
              onClick={() => {
                setCurrentDate(month);
                setViewMode('month');
              }}
            >
              <div className="text-sm font-semibold">{format(month, 'MMM')}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {monthActivity > 0 ? `${Math.round((monthActivity / (monthDays.length * 4)) * 100)}%` : '0%'}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="card-modern glass dark:glass-dark overflow-hidden">
      {/* Header - Always Static */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-2">
            Activity Heat Map
            {backgroundLoading && (
              <div className="w-3 h-3 rounded-full bg-primary/60 animate-pulse" />
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* View Mode Toggle - Only show when expanded, positioned first */}
            {isExpanded && (
              <button
                onClick={() => setViewMode(viewMode === 'month' ? 'year' : 'month')}
                className="text-xs px-3 py-1.5 rounded-full bg-secondary/80 hover:bg-secondary transition-colors"
              >
                {viewMode === 'month' ? 'Year' : 'Month'}
              </button>
            )}
            
            {/* Expand/Collapse Toggle - Always in the same position */}
            <button
              onClick={handleToggleExpand}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-all duration-200 hover-scale"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3" />
                  <span>Compact</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  <span>Expand</span>
                </>
              )}
            </button>
          </div>
        </div>
      </CardHeader>
      
      {/* Content Area - Only data visualization shows loading */}
      <CardContent className="pt-0">
        {/* Content with smooth height transitions */}
        <div 
          className={cn(
            "overflow-hidden transition-all duration-500 ease-in-out",
            isExpanded ? "animate-in slide-in-from-top-2" : "animate-in slide-in-from-bottom-2"
          )}
          style={{
            minHeight: isExpanded ? '400px' : '280px',
            maxHeight: isExpanded ? 'none' : '400px'
          }}
        >
          {!isExpanded ? (
            /* Compact Week View with inline loading */
            loading ? (
              <div className="space-y-4">
                {/* Navigation skeleton - matches actual navigation */}
                <div className="flex items-center justify-between">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex flex-col items-center gap-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                {/* Stats skeleton */}
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="p-3 glass dark:glass-dark rounded-xl">
                      <Skeleton className="h-5 w-6 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  ))}
                </div>
                {/* Instruction text skeleton */}
                <div className="text-center">
                  <Skeleton className="h-3 w-48 mx-auto" />
                </div>
                {/* Week row skeleton */}
                <div className="grid grid-cols-7 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map(j => (
                    <Skeleton key={j} className="aspect-square rounded-xl" />
                  ))}
                </div>
              </div>
            ) : (
              renderCompactWeekView()
            )
          ) : (
            /* Full View with inline loading */
            <div className="space-y-6">
              {loading ? (
                // Expanded view skeleton
                <div className="space-y-4">
                  {/* Navigation skeleton */}
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex flex-col items-center gap-1">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </div>
                  {/* Day labels skeleton */}
                  <div className="grid grid-cols-7 gap-1 mb-3">
                    {[1, 2, 3, 4, 5, 6, 7].map(i => (
                      <Skeleton key={i} className="h-6 w-full" />
                    ))}
                  </div>
                  {/* Calendar grid skeleton */}
                  <div className="space-y-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="grid grid-cols-7 gap-1">
                        {[1, 2, 3, 4, 5, 6, 7].map(j => (
                          <Skeleton key={j} className="aspect-square rounded-xl" />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {viewMode === 'month' ? renderMonthView() : renderYearView()}
                  
                  {/* Legend - Only in expanded view */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Less</span>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map(level => (
                        <div
                          key={level}
                          className={cn(
                            "w-4 h-4 rounded transition-all duration-300 hover:scale-110",
                            getActivityColor(level)
                          )}
                        />
                      ))}
                    </div>
                    <span>More</span>
                  </div>
                  
                  {/* Stats summary - Only in expanded view */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">
                        {Object.values(activityData).filter(a => a.intensity > 0).length}
                      </div>
                      <div className="text-xs text-muted-foreground">Active Days</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {Math.round(Object.values(activityData).reduce((sum, a) => sum + a.intensity, 0) / Object.values(activityData).length) || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Avg Intensity</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">
                        {Math.max(...Object.values(activityData).map(a => a.intensity), 0)}
                      </div>
                      <div className="text-xs text-muted-foreground">Best Day</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>

      {/* Detailed Activity Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Activity Details
            </DialogTitle>
          </DialogHeader>
          {selectedDay && activityData[selectedDay] && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-primary/5 dark:bg-primary/10 rounded-lg">
                <h3 className="text-lg font-semibold text-primary">
                  {format(new Date(selectedDay), 'EEEE, MMMM d, yyyy')}
                </h3>
                <div className="text-sm text-muted-foreground mt-1">
                  Intensity Level: {activityData[selectedDay].intensity}/4
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <Clock className="h-6 w-6 text-primary mx-auto mb-1" />
                  <div className="text-xl font-bold">{activityData[selectedDay].minutes}</div>
                  <div className="text-xs text-muted-foreground">Minutes</div>
                </div>
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <Flame className="h-6 w-6 text-orange-500 mx-auto mb-1" />
                  <div className="text-xl font-bold">{activityData[selectedDay].calories}</div>
                  <div className="text-xs text-muted-foreground">Calories</div>
                </div>
              </div>

              {activityData[selectedDay].steps && activityData[selectedDay].steps! > 0 && (
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {activityData[selectedDay].steps!.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Steps Taken</div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Activity Breakdown</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Workout Duration:</span>
                    <span>{activityData[selectedDay].minutes} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Energy Burned:</span>
                    <span>{activityData[selectedDay].calories} cal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Intensity Score:</span>
                    <span className="text-primary font-medium">
                      {activityData[selectedDay].intensity}/4
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-center text-muted-foreground border-t border-border/30 pt-3">
                Keep up the great work! 💪
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};