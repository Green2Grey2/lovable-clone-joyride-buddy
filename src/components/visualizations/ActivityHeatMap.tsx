import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, subMonths, startOfYear, eachMonthOfInterval, isSameDay } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { activityTrackingService } from '@/utils/activityTrackingService';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Info, Activity, Clock, Flame } from 'lucide-react';

interface ActivityData {
  date: string;
  intensity: number; // 0-4 scale
  steps?: number;
  calories?: number;
  minutes?: number;
}

export const ActivityHeatMap: React.FC = () => {
  const { user } = useAuth();
  const [activityData, setActivityData] = useState<Record<string, ActivityData>>({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showTip, setShowTip] = useState(true);
  const [clickCount, setClickCount] = useState(0);
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user) {
      loadActivityData();
    }
  }, [user, currentDate, viewMode]);

  const loadActivityData = async () => {
    try {
      setLoading(true);
      const startDate = viewMode === 'month' 
        ? startOfMonth(currentDate)
        : startOfYear(currentDate);
      
      const endDate = viewMode === 'month'
        ? endOfMonth(currentDate)
        : new Date();

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

      setActivityData(processed);
    } catch (error) {
      console.error('Error loading activity data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleDayClick = (dateStr: string, activity: ActivityData | undefined) => {
    if (!activity) return;
    
    setSelectedDay(dateStr);
    setClickCount(prev => prev + 1);
    
    if (clickTimer) {
      clearTimeout(clickTimer);
    }
    
    const timer = setTimeout(() => {
      if (clickCount === 0) {
        // Single click - show enhanced tooltip (already handled by hover)
        setShowTip(false);
      } else if (clickCount === 1) {
        // Double click - show detailed modal
        setShowDetailModal(true);
      }
      setClickCount(0);
    }, 300);
    
    setClickTimer(timer);
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

    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
      <>
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day, i) => (
            <div key={i} className="text-xs text-muted-foreground text-center font-medium">
              {day}
            </div>
          ))}
        </div>
        
        {/* User Education Tip */}
        {showTip && viewMode === 'month' && (
          <div className="mb-4 p-3 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 text-sm">
              <Info className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-primary font-medium">💡 Tip:</span>
              <span className="text-muted-foreground">
                Tap days with activity for details, double-tap for full breakdown
              </span>
              <button 
                onClick={() => setShowTip(false)}
                className="ml-auto text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Calendar grid */}
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
                      "aspect-square rounded-lg transition-all duration-300 hover:scale-110 relative group",
                      isCurrentMonth ? getActivityColor(intensity) : 'bg-muted/10',
                      hasActivity ? 'cursor-pointer' : 'cursor-default',
                      isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                      // Add visual patterns
                      isCurrentMonth && getActivityPattern(intensity)
                    )}
                    onClick={() => hasActivity && handleDayClick(dateStr, activity)}
                  >
                    {/* Day number */}
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-foreground/70">
                      {isCurrentMonth && format(day, 'd')}
                    </span>
                    
                    {/* Activity indicator (+ icon) */}
                    {hasActivity && (
                      <div className="absolute top-0.5 right-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Plus className="h-2.5 w-2.5 text-primary animate-pulse" />
                      </div>
                    )}
                    
                    {/* Hover indicator for clickable days */}
                    {hasActivity && (
                      <div className="absolute inset-0 rounded-lg bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    )}
                    
                    {/* Enhanced Tooltip */}
                    {activity && (
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
                            Click for details • Double-click for more
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
      </>
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

  if (loading) {
    return (
      <Card className="card-modern glass dark:glass-dark">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="grid grid-cols-7 gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map(j => (
                  <Skeleton key={j} className="aspect-square rounded-lg" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-modern glass dark:glass-dark overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Activity Heat Map
          </CardTitle>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'month' ? 'year' : 'month')}
              className="text-xs px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              {viewMode === 'month' ? 'Year View' : 'Month View'}
            </button>
            {viewMode === 'month' && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                  className="p-1 hover:bg-accent/10 rounded transition-colors"
                >
                  ←
                </button>
                <span className="text-sm font-medium px-2">
                  {format(currentDate, 'MMM yyyy')}
                </span>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="p-1 hover:bg-accent/10 rounded transition-colors"
                  disabled={isSameMonth(currentDate, new Date())}
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'month' ? renderMonthView() : renderYearView()}
        
        {/* Legend */}
        <div className="flex items-center justify-between mt-6 text-xs text-muted-foreground">
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
        
        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/50">
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